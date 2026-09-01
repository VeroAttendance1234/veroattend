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
       EHOSTUNREACH. The LINK-LOCAL address is derived from the Pi's MAC, so it
       never changes, and it forces a matching link-local source address.

    3. Vite's proxy cannot use a link-local address: Node's WHATWG URL parser
       rejects the '%en0' zone index with ERR_INVALID_URL, which crashes the
       dev server on the first proxied request. Raw sockets have no such
       problem.
    Hence a small TCP bridge: it accepts connections on localhost and pipes
    them byte-for-byte to the Pi. Being TCP-level, WebSocket upgrades pass
    through untouched, so Socket.IO works without extra handling.
                                                                         */
/*  Candidate addresses for the Pi, tried in order until one connects.
    The Pi moves between networks (iPhone hotspot vs home Wi-Fi) and each
    network only supports some of these, so hardcoding one address meant
    re-editing this file every time the network changed:

      1. VITE_PI_HOST      - explicit override, wins when set.
      2. veroattendance.local - mDNS. Works on a normal LAN. On the iPhone
         hotspot the name resolves but adds ~5s while the IPv4 lookup times
         out, so it is not first.
      3. link-local IPv6   - derived from the Pi's MAC, so it never changes
         and needs no DNS. Works on any shared layer-2 link, including the
         hotspot. '%en0' is the interface; change it for Ethernet.

    The address that works is remembered and tried first next time, so the
    fallback cost is paid once, not on every request.                        */
const PI_CANDIDATES = process.env.VITE_PI_HOST
  ? [process.env.VITE_PI_HOST]
  : ['fe80::ba27:ebff:fe2e:f33d%en0', 'veroattendance.local']
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

      bridge.on('error', (err) => {
        log.error(`[pi-bridge] cannot listen on ${BRIDGE_PORT}: ${err.message}`)
      })
      bridge.listen(BRIDGE_PORT, '127.0.0.1', () => {
        log.info(`  [pi-bridge] 127.0.0.1:${BRIDGE_PORT} -> ${PI_CANDIDATES.join(' | ')}:${PI_PORT}`)
      })

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
