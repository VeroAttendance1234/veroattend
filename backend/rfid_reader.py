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


def start_reader(on_tap_callback):
    try:
        from smartcard.System import readers
        from smartcard.util import toHexString
        from smartcard.Exceptions import NoCardException, CardConnectionException
    except ImportError:
        print("[rfid_reader] pyscard not installed. Run: pip install pyscard")
        return

    GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]

    print("[rfid_reader] Waiting for ACR122U reader...")
    while True:
        r = readers()
        if r:
            break
        time.sleep(1)

    reader = r[0]
    print(f"[rfid_reader] Using reader: {reader}")

    last_uid = None

    while True:
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
            last_uid = None
            time.sleep(0.3)
        except Exception as e:
            print(f"[rfid_reader] Error: {e}")
            time.sleep(1)


if __name__ == '__main__':
    def demo(uid):
        print(f"TAP: {uid}")
    start_reader(demo)
