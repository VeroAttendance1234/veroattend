import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'attendance.db')

STUDENTS = [
    ("S001", "Aisha Patel",     11, "11B", "04A32B11"),
    ("S002", "Liam Chen",       11, "11B", "04B21C22"),
    ("S003", "Sofia Nguyen",    12, "12A", "04C43D33"),
    ("S004", "Marcus Williams", 12, "12A", "04D54E44"),
    ("S005", "Priya Sharma",    11, "11A", "04E65F55"),
    ("S006", "Jack Thompson",   10, "10C", "04F76G66"),
    ("S007", "Emma Davis",      10, "10C", "04G87H77"),
    ("S008", "Noah Kim",        12, "12B", "04H98I88"),
]


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            year INTEGER,
            class TEXT,
            uid  TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
            date       TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );
    """)
    c.executemany(
        "INSERT OR IGNORE INTO students (id, name, year, class, uid) VALUES (?,?,?,?,?)",
        STUDENTS,
    )
    conn.commit()
    conn.close()


def get_student_by_uid(uid):
    conn = get_conn()
    row = conn.execute("SELECT * FROM students WHERE uid=?", (uid,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_students():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM students").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def log_attendance(student_id):
    from datetime import date
    today = date.today().isoformat()
    conn = get_conn()
    conn.execute(
        "INSERT INTO attendance (student_id, date) VALUES (?, ?)",
        (student_id, today),
    )
    conn.commit()
    conn.close()


def get_today_attendance():
    from datetime import date
    today = date.today().isoformat()
    conn = get_conn()
    rows = conn.execute(
        "SELECT student_id, timestamp FROM attendance WHERE date=? ORDER BY timestamp DESC",
        (today,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
