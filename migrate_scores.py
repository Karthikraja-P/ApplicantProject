import sqlite3

def migrate_db():
    conn = sqlite3.connect('applications.db')
    cursor = conn.cursor()
    
    # Add columns if they don't exist
    columns_to_add = [
        ('iq_score', 'TEXT'),
        ('sk_pct', 'TEXT')
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f'ALTER TABLE applications ADD COLUMN {col_name} {col_type}')
            print(f"Added column: {col_name}")
        except sqlite3.OperationalError:
            print(f"Column already exists: {col_name}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate_db()
