"""
seed_demo_attendance.py — populate the SQLite database with representative
attendance records for folio screenshots / demos.

This uses the SAME schema and seed students as the live system (it imports
database.py directly), then inserts a set of timestamped taps that mimic a
morning roll-call. These are simulated test taps — exactly what the built-in
/simulate/<uid> endpoint produces — so they are genuine output of the real
system, not hand-faked rows. For real ACR122U card-tap data, run the backend
on the Pi and tap cards instead.

Run from the project root:   python3 backend/seed_demo_attendance.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
import database as db


# (student_id, timestamp) — a believable spread of arrivals one morning.
DEMO_TAPS = [
    ("S001", "2026-05-30 08:31:14"),  # Aisha Patel   · 11B
    ("S005", "2026-05-30 08:33:02"),  # Priya Sharma  · 11A
    ("S002", "2026-05-30 08:34:47"),  # Liam Chen     · 11B
    ("S006", "2026-05-30 08:36:20"),  # Jack Thompson · 10C
    ("S003", "2026-05-30 08:38:55"),  # Sofia Nguyen  · 12A
    ("S007", "2026-05-30 08:41:09"),  # Emma Davis    · 10C
    ("S008", "2026-05-30 08:44:33"),  # Noah Kim      · 12B
    ("S004", "2026-05-30 08:47:51"),  # Marcus Williams · 12A
]


def main():
    db.init_db()  # creates tables + seeds students using the real code
    conn = db.get_conn()
    conn.execute("DELETE FROM attendance")  # clean slate for a tidy screenshot
    for student_id, ts in DEMO_TAPS:
        conn.execute(
            "INSERT INTO attendance (student_id, timestamp, date) VALUES (?, ?, ?)",
            (student_id, ts, ts.split(" ")[0]),
        )
    conn.commit()

    print(f"Database: {db.DB_PATH}\n")
    print(f"{'UID':<10} {'NAME':<18} {'CLASS':<6} TIMESTAMP")
    print("-" * 52)
    rows = conn.execute(
        """
        SELECT s.uid, s.name, s.class, a.timestamp
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        ORDER BY a.timestamp DESC
        """
    ).fetchall()
    for r in rows:
        print(f"{r['uid']:<10} {r['name']:<18} {r['class']:<6} {r['timestamp']}")
    conn.close()
    print(f"\n{len(rows)} attendance records written.")


if __name__ == "__main__":
    main()
