import sqlite3

def fix_db():
    conn = sqlite3.connect('applications.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS admin_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database fixed: admin_logs table created.")

if __name__ == "__main__":
    fix_db()
