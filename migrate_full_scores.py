import sqlite3

def migrate_db_full():
    conn = sqlite3.connect('applications.db')
    cursor = conn.cursor()
    
    # Complete list of columns to ensure everything is mirrored
    columns_to_add = [
        ('iq_score', 'TEXT'),
        ('iq_total', 'TEXT'),
        ('iq_pct', 'TEXT'),
        ('sk_track', 'TEXT'),
        ('sk_pct', 'TEXT'),
        ('game_bart_profile', 'TEXT'),
        ('game_he_profile', 'TEXT'),
        ('game_igt_profile', 'TEXT'),
        ('scores_updated_at', 'TEXT')
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
    migrate_db_full()
