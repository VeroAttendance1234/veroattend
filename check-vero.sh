#!/bin/bash
# Is the live demo actually working end to end? Run this any time.
#   ./check-vero.sh
#
# Checks the chain in the order it breaks in practice, so the FIRST failure
# printed is the one to fix.

PI=veroattendance.local
SITE=https://veroattend.vercel.app
ok=0; bad=0
pass(){ printf "  \033[32mOK\033[0m   %s\n" "$1"; ok=$((ok+1)); }
fail(){ printf "  \033[31mFAIL\033[0m %s\n" "$1"; bad=$((bad+1)); }

echo "VERO health check · $(date '+%a %d %b %H:%M')"
echo

# 1. Pi reachable on the LAN at all.
if ping -c1 -t3 "$PI" >/dev/null 2>&1; then pass "Pi is on the network"
else fail "Pi unreachable - powered off, or not on this Wi-Fi"; fi

# 2. Backend listening. The watchdog should fix this within 60s by itself.
URL=$(ssh -o BatchMode=yes -o ConnectTimeout=8 vero@$PI 'cat ~/backend/tunnel-url.txt' 2>/dev/null)
if ssh -o BatchMode=yes -o ConnectTimeout=8 vero@$PI 'pgrep -f app.py >/dev/null' 2>/dev/null
then pass "backend process running"
else fail "backend down (watchdog should restart it within 60s)"; fi

# 3. Reader physically present.
if ssh -o BatchMode=yes -o ConnectTimeout=8 vero@$PI 'lsusb | grep -qi acr122' 2>/dev/null
then pass "ACR122U plugged in"
else fail "ACR122U not detected on USB"; fi

# 4. The tunnel answers publicly. This is what the deployed site depends on.
if [ -n "$URL" ] && curl -s -m 15 -o /dev/null -w '' "$URL/students" 2>/dev/null
then pass "public tunnel answering  ($URL)"
else fail "public tunnel not answering ($URL)"; fi

# 5. THE ONE THAT BITES: the site compiles the tunnel hostname in at build
#    time, so a restarted tunnel leaves the deployed site pointing at a dead
#    hostname. Everything above can pass while the website shows nothing.
LIVE_HOST=$(echo "$URL" | sed 's#https://##')
if [ -n "$LIVE_HOST" ] && curl -s -m 20 "$SITE/" 2>/dev/null \
     | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1 \
     | xargs -I{} curl -s -m 20 "$SITE{}" 2>/dev/null | grep -q "$LIVE_HOST"
then pass "deployed site points at the CURRENT tunnel"
else fail "deployed site points at an OLD tunnel - update PI_TUNNEL_URL in src/App.jsx to $URL, then push"; fi

echo
[ "$bad" -eq 0 ] && echo "All good ($ok/5)." || echo "$bad of $((ok+bad)) checks failed."
