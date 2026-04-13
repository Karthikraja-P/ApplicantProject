import sqlite3
import boto3
import os
from datetime import datetime
from boto3.dynamodb.conditions import Key
from dotenv import load_dotenv

load_dotenv()

DB_PATH = 'applications.db'
DYNAMO_TABLE = os.environ.get('DYNAMO_TABLE', 'applicant-submissions-dev')
AWS_REGION = os.environ.get('AWS_REGION', 'ap-south-1')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def sync():
    print(f"🚀 Starting sync from DynamoDB ({DYNAMO_TABLE}) in {AWS_REGION}...")
    
    session_kwargs = dict(region_name=AWS_REGION)
    key_id = os.environ.get('AWS_ACCESS_KEY_ID')
    secret  = os.environ.get('AWS_SECRET_ACCESS_KEY')
    if key_id and secret and key_id != 'your_access_key_here':
        session_kwargs['aws_access_key_id']     = key_id
        session_kwargs['aws_secret_access_key'] = secret

    dynamodb = boto3.resource('dynamodb', **session_kwargs)
    table = dynamodb.Table(DYNAMO_TABLE)
    
    # 1. Scan/Query all applications from DynamoDB
    # Note: Scanning might be expensive on very large tables, but for this use case it's fine.
    # Alternatively, we could query specific emails if we knew them.
    response = table.scan()
    items = response.get('Items', [])
    
    conn = get_db()
    
    synced_count = 0
    for item in items:
        # Check if it's an application record
        if not str(item.get('submission_type#timestamp', '')).startswith('application#'):
            continue
            
        email = item.get('email')
        submitted_at = item.get('submitted_at')
        
        # Check if already in SQLite
        existing = conn.execute('SELECT 1 FROM applications WHERE email = ? AND submitted_at = ?', (email, submitted_at)).fetchone()
        
        if not existing:
            print(f"📦 Rescuing {email} ({submitted_at})...")
            # Prepare columns and values
            # We filter out keys that don't exist in our SQLite schema
            valid_cols = [
                'submitted_at', 'full_name', 'email', 'country_code', 'phone', 
                'location_country', 'location', 'linkedin', 'current_role', 
                'current_company', 'experience', 'degree', 'field', 'university', 
                'cv_filename', 'portfolio', 'github', 'website', 'work_type', 
                'start_date', 'work_preference', 'constraints', 'interest', 
                'problems', 'area', 'skills', 'source', 'db_databases', 
                'db_query_tools', 'db_backend_langs', 'db_experience', 
                'db_optimized', 'db_desc', 'ml_libs', 'ml_fin_data', 
                'ml_concepts', 'ml_experience', 'ml_built', 'ml_desc', 
                'ai_tools', 'ai_areas', 'ai_langs', 'ai_experience', 
                'ai_deployed', 'ai_desc', 'iq_score', 'iq_total', 'iq_pct', 
                'sk_track', 'sk_pct', 'game_bart_profile', 'game_he_profile', 
                'game_igt_profile', 'scores_updated_at'
            ]
            
            insert_data = {}
            for col in valid_cols:
                if col in item:
                    insert_data[col] = str(item[col])
            
            if insert_data:
                cols = ', '.join(f'`{k}`' for k in insert_data.keys())
                placeholders = ', '.join(['?'] * len(insert_data))
                conn.execute(
                    f'INSERT INTO applications ({cols}) VALUES ({placeholders})',
                    list(insert_data.values())
                )
                synced_count += 1
    
    conn.commit()
    conn.close()
    print(f"✅ Sync complete! Rescued {synced_count} records.")

if __name__ == '__main__':
    sync()
