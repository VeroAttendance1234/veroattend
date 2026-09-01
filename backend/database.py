import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'attendance.db')

# THIS is the table a physical tap is resolved against: on_card_tap() calls
# get_student_by_uid() with whatever the ACR122U read, and anything not
# matched here is logged as an unknown card and never reaches the browser.
#
# So the first five UIDs below are the REAL ones, read off the actual cards,
# and they must stay identical to the uid values stamped onto the roster in
# src/data/sampleData.js. They previously held invented placeholders, which
# meant every real card came back unknown and no tap ever appeared on screen.
# S005 Grace Turner is the demo persona and 67BDE33D is the card the marker
# taps, so that row in particular has to stay correct. Names, years and
# classes match sampleData.js too, since
# a real tap broadcasts THIS record and the feed shows these values, not the
# browser's own roster entry.
STUDENTS = [
    ("S001", "Toby Crowther",   12, "12A", "3041835B"),
    ("S002", "Jack Wilson",     11, "11B", "A139E43D"),
    ("S003", "Emily Clarke",    12, "12A", "C92BE43D"),
    ("S004", "Thomas Baker",    12, "12A", "1CC9E33D"),
    ("S005", "Grace Turner",    11, "11A", "67BDE33D"),
    # Spare enrolments with no physical card issued yet. The placeholders are
    # at least valid hex now; two of the old ones contained the letter G,
    # which uid_to_string() cannot produce, so they could never have matched
    # anything under any circumstances.
    ("S006", "Jack Thompson",   10, "10C", "04F76A66"),
    ("S007", "Emma Davis",      10, "10C", "04A87B77"),
    ("S008", "Noah Kim",        12, "12B", "04B98C88"),
]


def get_conn():
    # timeout: log_attendance() writes from the RFID reader thread while the
    # /students and /attendance handlers read from Flask's request threads.
    # On a slow SD card those collide, and sqlite3's default is to give up
    # after 5s and raise "database is locked" - which surfaces as a silently
    # dropped tap, since rfid_reader.py catches and continues. Wait longer.
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    # WAL lets a reader run concurrently with a writer; the default rollback
    # journal blocks both directions. Set on the file itself and persistent,
    # but issued per-connection so a freshly created data/ dir gets it too.
    conn.execute("PRAGMA journal_mode=WAL")
    # NORMAL is the standard pairing with WAL: durable across a process crash,
    # and it drops an fsync per commit, which matters on SD card flash.
    conn.execute("PRAGMA synchronous=NORMAL")
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
    # Upsert rather than INSERT OR IGNORE. A Pi that has run before already
    # has these rows, and OR IGNORE would silently keep the stale placeholder
    # UIDs forever - the table would look correct in source and still reject
    # every real card at the reader. This way the Pi self-corrects on the next
    # restart instead of needing its database deleted by hand.
    c.executemany(
        """
        INSERT INTO students (id, name, year, class, uid) VALUES (?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
            name  = excluded.name,
            year  = excluded.year,
            class = excluded.class,
            uid   = excluded.uid
        """,
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


def get_today_tap_count(student_id):
    """How many times this student has tapped today, including the tap just
    logged. Callers use the parity to decide in vs out: odd means they are
    currently in, even means they have tapped back out.

    This lives on the Pi rather than in each browser on purpose. Two clients
    watching the same reader used to each decide in/out from their own local
    copy of the roster, so a laptop and a phone that had drifted apart would
    read the SAME physical tap as opposite actions. Counting rows makes the
    database the single answer, and it survives a restart, which an in-memory
    toggle would not.
    """
    from datetime import date
    today = date.today().isoformat()
    conn = get_conn()
    n = conn.execute(
        "SELECT COUNT(*) AS n FROM attendance WHERE student_id=? AND date=?",
        (student_id, today),
    ).fetchone()['n']
    conn.close()
    return n


def get_today_attendance():
    """Today's taps, newest first, shaped exactly like a live `card_tap`
    payload so a client joining mid-day can build its feed straight from
    these rows without a separate code path.

    Read ascending internally so each tap's action can be worked out the same
    way on_card_tap() does it - nth tap of the day for that student, odd is
    in, even is out - then reversed at the end, because the feed reads newest
    first.
    """
    from datetime import date
    today = date.today().isoformat()
    conn = get_conn()
    rows = conn.execute(
        """
        SELECT a.id, a.student_id, a.timestamp,
               s.name, s.year, s.class, s.uid
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        WHERE a.date = ?
        ORDER BY a.timestamp ASC, a.id ASC
        """,
        (today,),
    ).fetchall()
    conn.close()

    counts = {}
    enriched = []
    for r in rows:
        d = dict(r)
        n = counts.get(d['student_id'], 0) + 1
        counts[d['student_id']] = n
        d['action'] = 'in' if n % 2 == 1 else 'out'
        enriched.append(d)
    enriched.reverse()
    return enriched
