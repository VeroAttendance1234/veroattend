import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import net from 'node:net'
import dns from 'node:dns'

// The demo network (iPhone hotspot) is IPv6-only with NAT64 - the Pi has no
// IPv4 address at all. Node's default resolution order tries A records first
// and waits for that to time out, adding ~5s to every connection.
dns.setDefaultResultOrder('ipv6first')

/*  Reaching the Raspberry Pi from the browser
    ─────────────────────────────────────────
    Three separate obstacles, which is why this is not just a proxy line:

    1. A browser needs OS-level local-network permission to talk to the Pi
       directly (macOS Sequoia enforces this). Without it the connection fails
       as ERR_INTERNET_DISCONNECTED and the UI silently stays in Simulator mode.
       Fix: the page only ever talks to localhost; the dev server relays.

    2. The Pi's GLOBAL IPv6 address changes every time the hotspot reconnects,
       and the Mac accumulates several global addresses of its own, not all of
       which route. Connecting to the global address yields intermittent
       EHOSTUNREACH. A LINK-LOCAL address avoids that: it is never routed and
       it forces a matching link-local source address. It is stable per
       network, but see the NOTE below - it is not stable ACROSS networks.

    3. Vite's proxy cannot use a link-local address: Node's WHATWG URL parser
       rejects the '%en0' zone index with ERR_INVALID_URL, which crashes the
       dev server on the first proxied request. Raw sockets have no such
       problem.
    Hence a small TCP bridge: it accepts connections on localhost and pipes
    them byte-for-byte to the Pi. Being TCP-level, WebSocket upgrades pass
    through untouched, so Socket.IO works without extra handling.
                                                                         */
/*  Candidate addresses for the Pi, raced in parallel until one connects.
    The Pi moves between networks (phone hotspot vs home Wi-Fi vs the Telstra
    hotspot) and each network only supports some of these:

      1. VITE_PI_HOST         - explicit override, wins when set.
      2. veroattendance.local - mDNS. Works on any network carrying Bonjour,
         which includes the Telstra hotspot and a normal LAN. On an iPhone
         hotspot it still resolves but costs ~5s while the IPv4 lookup times
         out - harmless now that candidates are raced rather than tried in
         turn, so a slow candidate never delays a fast one.
      3. link-local IPv6      - needs no DNS at all, so it covers a network
         with no working mDNS. '%en0' is the Wi-Fi interface; change it for
         Ethernet.

    NOTE: the link-local address is NOT permanently tied to the MAC. This file
    used to hardcode fe80::ba27:ebff:fe2e:f33d first, on the assumption that it
    was EUI-64 derived and so fixed forever. NetworkManager on the Pi actually
    defaults to RFC 7217 'stable-privacy' addressing, which hashes the
    connection profile into the address - so joining a new Wi-Fi network gives
    the Pi a NEW link-local address and the old one goes dead with no error
    beyond the UI sitting in Simulator mode. That is precisely what the move to
    the Telstra hotspot did. Hence mDNS first, and treat the address below as a
    snapshot of the current network, not a constant.

    To make it a constant, run on the Pi and reconnect:
      sudo nmcli connection modify "<profile>" ipv6.addr-gen-mode eui64
    which restores the MAC-derived address the original comment assumed.

    The address that works is remembered and tried first next time, so the
    fallback cost is paid once, not on every request.                        */
const PI_CANDIDATES = process.env.VITE_PI_HOST
  ? [process.env.VITE_PI_HOST]
  : [
      'veroattendance.local',
      // Current stable-privacy link-local on the TELSTRA4G profile.
      'fe80::c7dc:25f3:5003:e58a%en0',
      // MAC-derived (EUI-64) address. Dead while addr-gen-mode is the default
      // stable-privacy, live the moment the nmcli pin above is applied. Listed
      // permanently so the pin needs no edit here, and so a re-image that comes
      // up EUI-64 still connects. Racing makes an unused candidate free.
      'fe80::ba27:ebff:fe2e:f33d%en0',
    ]
const PI_PORT     = Number(process.env.VITE_PI_PORT || 5000)
const BRIDGE_PORT = Number(process.env.VITE_BRIDGE_PORT || 5099)
const CONNECT_TIMEOUT_MS = Number(process.env.VITE_PI_TIMEOUT || 3000)

function piBridge() {
  return {
    name: 'pi-tcp-bridge',
    configureServer(server) {
      const log = server.config.logger
      // Remembered across connections; reset whenever it stops working.
      let preferred = null

      /*  Race every candidate at once rather than trying them in turn.
          Serial attempts cost the sum of the timeouts - with two candidates
          that was 8s on a network where the Pi is absent, longer than the
          client's own 4s socket timeout, so a reconnect could never succeed
          before it gave up. Racing costs the FASTEST failure, not the total,
          and on success takes whichever address answers first. Same idea as
          Happy Eyeballs. Losers are destroyed as soon as a winner appears. */
      function dial(onReady, onFail) {
        const order = preferred
          ? [preferred, ...PI_CANDIDATES.filter(h => h !== preferred)]
          : [...PI_CANDIDATES]
        const pending = []
        let done = false
        let failures = 0

        const cleanupLosers = (winner) => {
          for (const s of pending) if (s !== winner) s.destroy()
        }

        for (const host of order) {
          const sock = net.connect({ host, port: PI_PORT })
          pending.push(sock)
          const lose = () => {
            sock.destroy()
            if (done) return
            if (++failures === order.length) { done = true; onFail() }
          }
          sock.setTimeout(CONNECT_TIMEOUT_MS, lose)
          sock.once('error', lose)
          sock.once('connect', () => {
            if (done) { sock.destroy(); return }
            done = true
            sock.setTimeout(0)          // Socket.IO stays idle between taps
            cleanupLosers(sock)
            if (preferred !== host) {
              log.info(`  [pi-bridge] using ${host}:${PI_PORT}`)
              preferred = host
            }
            onReady(sock)
          })
        }
      }

      const bridge = net.createServer((client) => {
        // The client socket stays paused until pipe() resumes it, so any
        // request bytes sent before the Pi answers are buffered, not lost.
        client.on('error', () => client.destroy())
        dial(
          (upstream) => {
            const close = () => { client.destroy(); upstream.destroy() }
            upstream.on('error', close)
            client.on('close', () => upstream.destroy())
            upstream.on('close', () => client.destroy())
            client.pipe(upstream)
            upstream.pipe(client)
          },
          () => {
            // Every candidate failed: forget the cached one so the next
            // attempt re-probes from scratch rather than retrying a dead host.
            preferred = null
            client.destroy()
          },
        )
      })

      /*  Vite restarts this plugin on every edit to this file, and the new
          instance's configureServer() runs BEFORE the outgoing httpServer's
          'close' handler releases the bridge port. The bind loses the race,
          fails EADDRINUSE, and the dev server comes back up with no route to
          the Pi at all: every /socket.io request then dies as ECONNREFUSED
          and the UI drops to Simulator mode with nothing on screen saying
          why. That is the exact silent failure this bridge exists to prevent,
          so retry the bind briefly rather than giving up on first collision. */
      let bindAttempts = 0
      const listenBridge = () => bridge.listen(BRIDGE_PORT, '127.0.0.1')

      bridge.on('listening', () => {
        log.info(`  [pi-bridge] 127.0.0.1:${BRIDGE_PORT} -> ${PI_CANDIDATES.join(' | ')}:${PI_PORT}`)
      })
      bridge.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && ++bindAttempts <= 20) {
          setTimeout(listenBridge, 150)   // ~3s of grace, then report it
          return
        }
        log.error(`[pi-bridge] cannot listen on ${BRIDGE_PORT}: ${err.message}`)
      })
      listenBridge()

      server.httpServer?.once('close', () => bridge.close())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), piBridge()],
  server: {
    /*  Bind every interface, not just loopback. A phone on the same Wi-Fi
        reaches this dev server on the laptop's LAN address, and the default
        localhost-only bind refuses that connection outright - the page never
        loads, so the socket code below never even gets a chance to run.
        The phone then reaches the Pi the same way the laptop does: through
        the /socket.io proxy into the TCP bridge, which still listens on
        127.0.0.1 and is not itself exposed to the network.               */
    host: true,
    /*  Vite's DNS-rebinding guard lets bare IP literals and localhost through
        but answers any other hostname with a flat "Blocked request". Reaching
        the laptop from a phone by its Bonjour name (tobys-macbook.local) is
        exactly that case, and the failure gives no hint why, so allow the
        mDNS suffix. IP addresses already pass without being listed.        */
    allowedHosts: ['.local'],
    proxy: {
      '/socket.io': { target: `http://127.0.0.1:${BRIDGE_PORT}`, changeOrigin: true, ws: true },
      '/pi':        { target: `http://127.0.0.1:${BRIDGE_PORT}`, changeOrigin: true, rewrite: p => p.replace(/^\/pi/, '') },
    },
  },
})
