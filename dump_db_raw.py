import sqlite3

def dump_db():
    conn = sqlite3.connect('applications.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.execute('SELECT * FROM applications LIMIT 5')
    rows = cursor.fetchall()
    print("Schema Columns:", rows[0].keys() if rows else "No rows found")
    for r in rows:
        print(dict(r))
    conn.close()

if __name__ == "__main__":
    dump_db()
