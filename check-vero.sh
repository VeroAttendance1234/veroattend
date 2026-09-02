#!/bin/bash
# Is the live demo actually working end to end? Run this any time.
#   ./check-vero.sh
#
# Checks the chain in the order it breaks in practice, so the FIRST failure
# printed is the one to fix.

PI=veroattendance.local
SITE=https://veroattend.vercel.app
TS=https://veroattend.tail1cef38.ts.net
ok=0; bad=0; warn=0
pass(){ printf "  \033[32mOK\033[0m   %s\n" "$1"; ok=$((ok+1)); }
fail(){ printf "  \033[31mFAIL\033[0m %s\n" "$1"; bad=$((bad+1)); }
note(){ printf "  \033[33mWARN\033[0m %s\n" "$1"; warn=$((warn+1)); }

echo "VERO health check · $(date '+%a %d %b %H:%M')"
echo

# --- The two public addresses. The site races them, so ONE is enough to work.
if curl -s -m 20 -o /dev/null "$TS/students" 2>/dev/null
then pass "Tailscale (permanent address) answering"; tsup=1
else note "Tailscale not answering - site falls back to Cloudflare"; tsup=0; fi

CF=$(ssh -o BatchMode=yes -o ConnectTimeout=8 vero@$PI 'cat ~/backend/tunnel-url.txt' 2>/dev/null)
if [ -n "$CF" ] && curl -s -m 20 -o /dev/null "$CF/students" 2>/dev/null
then pass "Cloudflare (backup address) answering"; cfup=1
else note "Cloudflare not answering"; cfup=0; fi

if [ "$tsup" = 0 ] && [ "$cfup" = 0 ]; then
  fail "BOTH addresses down - the website cannot reach the Pi"
fi

# --- Is the Cloudflare address the site was built with still the current one?
#     Only a warning: Tailscale carries the site on its own if this drifted.
if [ -n "$CF" ] && curl -s -m 20 "$SITE/" 2>/dev/null \
     | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1 \
     | xargs -I{} curl -s -m 20 "$SITE{}" 2>/dev/null | grep -q "${CF#https://}"
then pass "site's Cloudflare fallback is current"
else note "site's Cloudflare fallback is stale (Tailscale is carrying it)"; fi

# --- Reader physically present. Everything above can pass with no reader.
if ssh -o BatchMode=yes -o ConnectTimeout=8 vero@$PI 'lsusb | grep -qi acr122' 2>/dev/null
then pass "ACR122U plugged in"
else fail "ACR122U not detected on USB"; fi

echo
if [ "$bad" -eq 0 ] && [ "$warn" -eq 0 ]; then echo "All good."
elif [ "$bad" -eq 0 ]; then echo "Working, with $warn warning(s) - the site is still up."
else echo "$bad critical failure(s)."; fi
