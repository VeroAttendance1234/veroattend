"""
ACR122U RFID reader script using pyscard (PC/SC).

Run this on the Raspberry Pi once the Flask backend is running.
It reads card UIDs continuously and calls on_card_tap() in app.py.

Prerequisites on the Pi:
    sudo apt install -y pcscd pcsc-tools libpcsclite-dev
    pip install pyscard
    sudo systemctl start pcscd
"""

import time
import binascii


# ── Poll cadence ────────────────────────────────────────────────
# IDLE_POLL_S is the one that decides how instant a tap feels. Every tap
# begins from the no-card state, so this interval bounds how long the reader
# can sit on a card before noticing it. At 0.3s a tap could lag by a third of
# a second before the WebSocket hop even started; 0.12s puts detection at
# roughly an eighth of a second without hammering pcscd.
IDLE_POLL_S = 0.12

# A card already sitting on the reader has been read and reported once, and
# last_uid suppresses repeats, so re-reading it quickly achieves nothing.
CARD_PRESENT_S = 0.5

# How often to ask pcscd whether the reader is still physically attached.
# The answer only changes when someone unplugs a USB cable.
PRESENCE_CHECK_S = 2.0


def uid_to_string(uid_bytes):
    return ''.join(f'{b:02X}' for b in uid_bytes)


def start_reader(on_tap_callback, status_callback=None):
    """Continuously read card UIDs from the ACR122U.

    on_tap_callback(uid)        -> called with the card UID on each new tap.
    status_callback(connected)  -> called with True/False whenever the reader's
                                    presence changes, so the UI can show whether
                                    the ACR122U is *actually* connected (not just
                                    whether the Flask server is reachable).
    """
    try:
        from smartcard.System import readers
        from smartcard.Exceptions import NoCardException, CardConnectionException
    except ImportError:
        print("[rfid_reader] pyscard not installed. Run: pip install pyscard")
        if status_callback:
            status_callback(False)
        return

    GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]

    # Only fire the status callback on an actual change, never on every poll.
    last_status = {'val': None}
    def report(val):
        if val != last_status['val']:
            last_status['val'] = val
            if status_callback:
                try:
                    status_callback(val)
                except Exception as e:
                    print(f"[rfid_reader] status_callback error: {e}")

    def list_readers():
        # readers() raises if the PC/SC context can't be established
        # (e.g. pcscd not running / access denied) — treat that as "no reader".
        try:
            return readers()
        except Exception as e:
            print(f"[rfid_reader] PC/SC unavailable: {e}")
            return []

    print("[rfid_reader] Waiting for ACR122U reader...")
    while True:
        # ── Discovery: block here until a reader is physically present ──
        r = list_readers()
        if not r:
            report(False)
            time.sleep(1)
            continue

        reader = r[0]
        report(True)
        print(f"[rfid_reader] Using reader: {reader}")

        last_uid = None
        next_presence_check = 0.0
        # ── Read loop: stays here while the reader remains attached ──
        while True:
            # Asking pcscd for the reader list is an IPC round trip. Running
            # it on every pass spent one on each ~120ms poll to answer a
            # question that only changes when a cable moves, so it is
            # throttled. Worst case the status pill is 2s stale; the tap path
            # below is untouched by this.
            if time.monotonic() >= next_presence_check:
                next_presence_check = time.monotonic() + PRESENCE_CHECK_S
                if not list_readers():
                    # Reader unplugged / PC/SC dropped — back to discovery.
                    report(False)
                    print("[rfid_reader] Reader lost — waiting for reconnect...")
                    break
            conn = None
            try:
                conn = reader.createConnection()
                conn.connect()
                data, sw1, sw2 = conn.transmit(GET_UID)
                if sw1 == 0x90:
                    uid = uid_to_string(data)
                    if uid != last_uid:
                        last_uid = uid
                        print(f"[rfid_reader] Card tapped: {uid}")
                        on_tap_callback(uid)
                time.sleep(CARD_PRESENT_S)
            except (NoCardException, CardConnectionException):
                # No card on the reader right now — reader itself is still fine.
                last_uid = None
                time.sleep(IDLE_POLL_S)
            except Exception as e:
                print(f"[rfid_reader] Error: {e}")
                time.sleep(1)
            finally:
                # Hand the PC/SC handle back explicitly instead of leaving it
                # to the garbage collector's timing. At ~8 polls a second this
                # is several hundred thousand handles a day, and trusting a
                # destructor to return every one of them is the kind of thing
                # that holds up for a demo and not for a term.
                if conn is not None:
                    try:
                        conn.disconnect()
                    except Exception:
                        pass


if __name__ == '__main__':
    def demo(uid):
        print(f"TAP: {uid}")
    start_reader(demo)
