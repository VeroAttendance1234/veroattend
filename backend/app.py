from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from database import init_db, get_student_by_uid, get_all_students, log_attendance, get_today_attendance
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'veroattend-secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ---------------------------------------------------------------
# Called by rfid_reader.py when a physical card is tapped
# ---------------------------------------------------------------
def on_card_tap(uid):
    student = get_student_by_uid(uid)
    if student:
        log_attendance(student['id'])
        socketio.emit('card_tap', student)
        print(f"[app] Tap logged: {student['name']} ({uid})")
    else:
        print(f"[app] Unknown card: {uid}")


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


@socketio.on('disconnect')
def handle_disconnect():
    print('[ws] Client disconnected')


# ---------------------------------------------------------------
# Start RFID reader thread alongside Flask
# ---------------------------------------------------------------
def start_rfid_thread():
    try:
        from rfid_reader import start_reader
        t = threading.Thread(target=start_reader, args=(on_card_tap,), daemon=True)
        t.start()
        print('[app] RFID reader thread started')
    except Exception as e:
        print(f'[app] RFID reader not started: {e}')


if __name__ == '__main__':
    init_db()
    start_rfid_thread()
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
