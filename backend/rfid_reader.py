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
        # ── Read loop: stays here while the reader remains attached ──
        while True:
            if not list_readers():
                # Reader was unplugged / PC/SC dropped — go back to discovery.
                report(False)
                print("[rfid_reader] Reader lost — waiting for reconnect...")
                break
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
                time.sleep(0.5)
            except (NoCardException, CardConnectionException):
                # No card on the reader right now — reader itself is still fine.
                last_uid = None
                time.sleep(0.3)
            except Exception as e:
                print(f"[rfid_reader] Error: {e}")
                time.sleep(1)


if __name__ == '__main__':
    def demo(uid):
        print(f"TAP: {uid}")
    start_reader(demo)
