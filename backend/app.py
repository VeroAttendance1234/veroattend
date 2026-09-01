import os

from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from database import (
    init_db, get_student_by_uid, get_all_students, log_attendance,
    get_today_attendance, get_today_tap_count,
)
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'veroattend-secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Whether the ACR122U reader is *actually* present right now. This is the
# source of truth for the UI's "VERO system" pill — the Flask server being
# reachable does NOT mean the reader works, so we track it separately.
reader_connected = False

# ---------------------------------------------------------------
# Called by rfid_reader.py when a physical card is tapped
# ---------------------------------------------------------------
def on_card_tap(uid):
    student = get_student_by_uid(uid)
    if student:
        log_attendance(student['id'])
        # Decide in vs out HERE, not in each browser. socketio.emit with no
        # room broadcasts to every connected client, so the laptop and the
        # phone receive one identical payload and cannot disagree about what
        # the tap meant. Odd tap count = they are in, even = they tapped out.
        action = 'in' if get_today_tap_count(student['id']) % 2 == 1 else 'out'
        socketio.emit('card_tap', {**student, 'action': action})
        print(f"[app] Tap logged: {student['name']} ({uid}) -> {action}")
    else:
        print(f"[app] Unknown card: {uid}")


# ---------------------------------------------------------------
# Called by rfid_reader.py whenever the reader appears/disappears
# ---------------------------------------------------------------
def on_reader_status(connected):
    global reader_connected
    reader_connected = bool(connected)
    socketio.emit('reader_status', {'connected': reader_connected})
    print(f"[app] ACR122U reader {'CONNECTED' if reader_connected else 'OFFLINE'}")


# ---------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------
@app.route('/students')
def route_students():
    return jsonify(get_all_students())


@app.route('/attendance')
def route_attendance():
    return jsonify(get_today_attendance())


# Simulate a tap via HTTP (useful for testing without hardware)
@app.route('/simulate/<uid>')
def route_simulate(uid):
    on_card_tap(uid)
    return jsonify({'ok': True, 'uid': uid})


# ---------------------------------------------------------------
# SocketIO events
# ---------------------------------------------------------------
@socketio.on('connect')
def handle_connect():
    print('[ws] Client connected')
    # Tell the freshly-connected page the current reader state right away,
    # so it doesn't have to wait for the next status change.
    emit('reader_status', {'connected': reader_connected})


@socketio.on('disconnect')
def handle_disconnect():
    print('[ws] Client disconnected')


# ---------------------------------------------------------------
# Start RFID reader thread alongside Flask
# ---------------------------------------------------------------
def start_rfid_thread():
    try:
        from rfid_reader import start_reader
        t = threading.Thread(
            target=start_reader,
            args=(on_card_tap, on_reader_status),
            daemon=True,
        )
        t.start()
        print('[app] RFID reader thread started')
    except Exception as e:
        print(f'[app] RFID reader not started: {e}')


if __name__ == '__main__':
    init_db()
    start_rfid_thread()
    # Bind '::' rather than '0.0.0.0' so the server accepts IPv6 as well as
    # IPv4. On an iPhone hotspot the clients get a /32 IPv4 address with no
    # local subnet, so IPv6 is the ONLY path from the laptop to the Pi -
    # an IPv4-only socket is unreachable there. Linux dual-stacks '::' by
    # default, so this still serves IPv4 on a normal school/home network.
    # allow_unsafe_werkzeug: Flask-SocketIO refuses to start on the Werkzeug
    # dev server without this. That guard is aimed at public deployments -
    # this server only ever runs on a Pi on a private demo network, serving
    # one laptop, so the dev server is the right tool and the warning is noise.
    # Port is overridable because macOS hands port 5000 to the AirPlay
    # receiver, so running this backend on the Mac rather than the Pi - which
    # .env documents as a supported setup - fails to bind with a message that
    # never mentions AirPlay. On the Pi the default is correct.
    port = int(os.environ.get('VERO_PORT', 5000))
    socketio.run(app, host='::', port=port, debug=False, allow_unsafe_werkzeug=True)
