from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import os
import json
import sqlite3
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')
app.secret_key = 'your_secret_key_here'

UPLOAD_FOLDER = 'uploads'
DB_PATH = 'applications.db'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ─── DynamoDB setup ────────────────────────────────────────────────────────────
DYNAMO_TABLE  = os.environ.get('DYNAMO_TABLE', 'applicant-submissions-dev')
AWS_REGION    = os.environ.get('AWS_REGION', 'ap-south-1')

_dynamodb = None

def get_dynamo_table():
    global _dynamodb
    if _dynamodb is None:
        session_kwargs = dict(region_name=AWS_REGION)
        # Use explicit credentials from .env if present
        key_id = os.environ.get('AWS_ACCESS_KEY_ID')
        secret  = os.environ.get('AWS_SECRET_ACCESS_KEY')
        if key_id and secret and key_id != 'your_access_key_here':
            session_kwargs['aws_access_key_id']     = key_id
            session_kwargs['aws_secret_access_key'] = secret
        _dynamodb = boto3.resource('dynamodb', **session_kwargs)
    return _dynamodb.Table(DYNAMO_TABLE)

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ─── Database setup ────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            submitted_at    TEXT NOT NULL,
            full_name       TEXT,
            email           TEXT,
            country_code    TEXT,
            phone           TEXT,
            location_country TEXT,
            location        TEXT,
            linkedin        TEXT,
            current_role    TEXT,
            current_company TEXT,
            experience      TEXT,
            degree          TEXT,
            field           TEXT,
            university      TEXT,
            cv_filename     TEXT,
            portfolio       TEXT,
            github          TEXT,
            website         TEXT,
            work_type       TEXT,
            start_date      TEXT,
            work_preference TEXT,
            constraints     TEXT,
            interest        TEXT,
            problems        TEXT,
            area            TEXT,
            skills          TEXT,
            source          TEXT,
            -- specialized fields
            db_databases    TEXT,
            db_query_tools  TEXT,
            db_backend_langs TEXT,
            db_experience   TEXT,
            db_optimized    TEXT,
            db_desc         TEXT,
            ml_libs         TEXT,
            ml_fin_data     TEXT,
            ml_concepts     TEXT,
            ml_experience   TEXT,
            ml_built        TEXT,
            ml_desc         TEXT,
            ai_tools        TEXT,
            ai_areas        TEXT,
            ai_langs        TEXT,
            ai_experience   TEXT,
            ai_deployed     TEXT,
            ai_desc         TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def multilist(key):
    """Return comma-joined list of multi-select checkboxes."""
    return ', '.join(request.form.getlist(key))

def _save_to_sqlite(item, submitted_at):
    """Fallback: persist to local SQLite when DynamoDB is unreachable."""
    try:
        conn = get_db()
        # Quote column names with backticks to handle special chars like #
        cols = ', '.join(f'`{k}`' for k in item.keys())
        placeholders = ', '.join(['?'] * len(item))
        conn.execute(
            f'INSERT OR REPLACE INTO applications ({cols}) VALUES ({placeholders})',
            list(item.values())
        )
        conn.commit()
        conn.close()
        print(f"[SQLite fallback] Saved {item.get('email')} locally")
    except Exception as ex:
        print(f"[SQLite fallback ERROR] {ex}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/save', methods=['POST'])
def save_progress():
    data = {
        'full_name': request.form.get('full_name'),
        'email': request.form.get('email'),
        'country_code': request.form.get('country_code'),
        'phone': request.form.get('phone'),
        'location_country': request.form.get('location_country'),
        'location': request.form.get('location'),
        'linkedin': request.form.get('linkedin'),
        'current_role': request.form.get('current_role'),
        'current_company': request.form.get('current_company'),
        'experience': request.form.get('experience'),
        'degree': request.form.get('degree'),
        'field': request.form.get('field'),
        'university': request.form.get('university'),
        'portfolio': request.form.get('portfolio'),
        'github': request.form.get('github'),
        'website': request.form.get('website'),
        'work_type': request.form.get('work_type'),
        'start_date': request.form.get('start_date'),
        'work_preference': request.form.get('work_preference'),
        'constraints': request.form.get('constraints'),
        'interest': request.form.get('interest'),
        'problems': request.form.get('problems'),
        'area': request.form.get('area'),
        'skills': request.form.getlist('skills'),
        'source': request.form.get('source')
    }
    session['form_data'] = data

    if not os.path.exists('saved_applications'):
        os.makedirs('saved_applications')

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    email = (data.get('email') or 'unknown').replace('@', '_at_')
    filename = f"saved_applications/draft_{email}_{timestamp}.json"
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

    return jsonify({'status': 'success', 'message': 'Progress saved successfully'})


@app.route('/load-draft', methods=['GET'])
def load_draft():
    if not os.path.exists('saved_applications'):
        return jsonify({'status': 'error', 'message': 'No saved drafts found'}), 404

    drafts = [f for f in os.listdir('saved_applications') if f.startswith('draft_')]
    if not drafts:
        return jsonify({'status': 'error', 'message': 'No saved drafts found'}), 404

    drafts.sort(key=lambda f: os.path.getmtime(os.path.join('saved_applications', f)), reverse=True)
    try:
        with open(os.path.join('saved_applications', drafts[0]), 'r') as f:
            data = json.load(f)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/')
def index():
    error = request.args.get('error')
    email = request.args.get('email', '')
    return render_template('index.html', error=error, prefill_email=email)


@app.route('/submit', methods=['POST'])
def submit():
    email = request.form.get('email', '').strip()

    # ── Duplicate email check ──────────────────────────────────────────────────
    if email:
        try:
            table = get_dynamo_table()
            resp  = table.query(
                KeyConditionExpression=Key('email').eq(email)
            )
            existing = [
                item for item in resp.get('Items', [])
                if str(item.get('submission_type#timestamp', '')).startswith('application#')
            ]
            if existing:
                return redirect(url_for('index', error='already_applied', email=email))
        except Exception:
            pass  # if DynamoDB unreachable, fall through and allow submission

    # ── CV upload ──────────────────────────────────────────────────────────────
    cv_filename = None
    if 'cv' in request.files:
        cv_file = request.files['cv']
        if cv_file and cv_file.filename:
            safe_name = (request.form.get('full_name') or 'applicant').replace(' ', '_')
            cv_filename = f"{safe_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}_CV.pdf"
            cv_file.save(os.path.join(app.config['UPLOAD_FOLDER'], cv_filename))

    # ── Build record ────────────────────────────────────────────────────────────
    submitted_at = datetime.now().isoformat()

    item = {
        'email':                      email,
        'submission_type#timestamp':  f'application#{submitted_at}',
        'submitted_at':               submitted_at,
        'full_name':        request.form.get('full_name', ''),
        'country_code':     request.form.get('country_code', ''),
        'phone':            request.form.get('phone', ''),
        'location_country': request.form.get('location_country', ''),
        'location':         request.form.get('location', ''),
        'linkedin':         request.form.get('linkedin', ''),
        'current_role':     request.form.get('current_role', ''),
        'current_company':  request.form.get('current_company', ''),
        'experience':       request.form.get('experience', ''),
        'degree':           request.form.get('degree', ''),
        'field':            request.form.get('field', ''),
        'university':       request.form.get('university', ''),
        'cv_filename':      cv_filename or '',
        'portfolio':        request.form.get('portfolio', ''),
        'github':           request.form.get('github', ''),
        'website':          request.form.get('website', ''),
        'work_type':        request.form.get('work_type', ''),
        'start_date':       request.form.get('start_date', ''),
        'work_preference':  request.form.get('work_preference', ''),
        'constraints':      request.form.get('constraints', ''),
        'interest':         request.form.get('interest', ''),
        'problems':         request.form.get('problems', ''),
        'area':             request.form.get('area', ''),
        'skills':           multilist('skills'),
        'source':           request.form.get('source', ''),
        # DB specialized
        'db_databases':     multilist('db_databases'),
        'db_query_tools':   multilist('db_query_tools'),
        'db_backend_langs': multilist('db_backend_langs'),
        'db_experience':    request.form.get('db_experience', ''),
        'db_optimized':     request.form.get('db_optimized', ''),
        'db_desc':          request.form.get('db_desc', ''),
        # ML specialized
        'ml_libs':          multilist('ml_libs'),
        'ml_fin_data':      multilist('ml_fin_data'),
        'ml_concepts':      multilist('ml_concepts'),
        'ml_experience':    request.form.get('ml_experience', ''),
        'ml_built':         request.form.get('ml_built', ''),
        'ml_desc':          request.form.get('ml_desc', ''),
        # AI specialized
        'ai_tools':         multilist('ai_tools'),
        'ai_areas':         multilist('ai_areas'),
        'ai_langs':         multilist('ai_langs'),
        'ai_experience':    request.form.get('ai_experience', ''),
        'ai_deployed':      request.form.get('ai_deployed', ''),
        'ai_desc':          request.form.get('ai_desc', ''),
    }

    # Remove empty strings so DynamoDB doesn't reject them
    item = {k: v for k, v in item.items() if v != ''}

    # ── Save to DynamoDB ────────────────────────────────────────────────────────
    try:
        table = get_dynamo_table()
        table.put_item(Item=item)
        print(f"[DynamoDB] Saved: {email} -> {DYNAMO_TABLE}")
    except ClientError as e:
        print(f"[DynamoDB ERROR] {e.response['Error']['Code']}: {e.response['Error']['Message']}")
        # Fallback: save to SQLite so no data is lost
        _save_to_sqlite(item, submitted_at)
    except Exception as e:
        print(f"[DynamoDB ERROR] {e}")
        _save_to_sqlite(item, submitted_at)

    area = request.form.get('area')
    if area == 'database':
        return redirect(url_for('next_database'))
    elif area == 'ml':
        return redirect(url_for('next_ml'))
    elif area == 'ai':
        return redirect(url_for('next_ai'))
    else:
        return redirect(url_for('next_not_sure'))


# ─── Admin: view all submissions ───────────────────────────────────────────────

@app.route('/admin/applications')
def admin_applications():
    conn = get_db()
    rows = conn.execute(
        'SELECT id, submitted_at, full_name, email, area, experience, location_country FROM applications ORDER BY id DESC'
    ).fetchall()
    conn.close()

    rows_html = ''.join(
        f"<tr>"
        f"<td>{r['id']}</td>"
        f"<td>{r['submitted_at'][:19]}</td>"
        f"<td>{r['full_name'] or '—'}</td>"
        f"<td>{r['email'] or '—'}</td>"
        f"<td>{r['area'] or '—'}</td>"
        f"<td>{r['experience'] or '—'}</td>"
        f"<td>{r['location_country'] or '—'}</td>"
        f"<td><a href='/admin/applications/{r['id']}'>View</a></td>"
        f"</tr>"
        for r in rows
    )

    return f"""<!DOCTYPE html><html><head><title>Applications</title>
    <style>body{{font-family:monospace;padding:24px;background:#0d1b2e;color:#c2d7f2}}
    table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #2a3f60;padding:8px 12px;text-align:left}}
    th{{background:#1a2f4e;color:#00d4ff}}tr:nth-child(even){{background:#111e30}}
    a{{color:#00d4ff}}</style></head><body>
    <h2>Submitted Applications ({len(rows)})</h2>
    <table><tr><th>#</th><th>Submitted</th><th>Name</th><th>Email</th><th>Area</th><th>Exp.</th><th>Country</th><th></th></tr>
    {rows_html if rows_html else '<tr><td colspan=8>No submissions yet.</td></tr>'}
    </table></body></html>"""


@app.route('/admin/applications/<int:app_id>')
def admin_application_detail(app_id):
    conn = get_db()
    row = conn.execute('SELECT * FROM applications WHERE id = ?', (app_id,)).fetchone()
    conn.close()
    if not row:
        return 'Not found', 404

    fields_html = ''.join(
        f"<tr><td><strong>{k}</strong></td><td>{row[k] or '—'}</td></tr>"
        for k in row.keys()
    )
    return f"""<!DOCTYPE html><html><head><title>Application #{app_id}</title>
    <style>body{{font-family:monospace;padding:24px;background:#0d1b2e;color:#c2d7f2}}
    table{{border-collapse:collapse;width:100%}}td{{border:1px solid #2a3f60;padding:8px 12px}}
    tr:nth-child(even){{background:#111e30}}td:first-child{{color:#00d4ff;width:200px}}
    a{{color:#00d4ff}}</style></head><body>
    <a href="/admin/applications">← Back</a>
    <h2>Application #{app_id}</h2>
    <table>{fields_html}</table></body></html>"""


# ─── Remaining routes (unchanged) ─────────────────────────────────────────────

@app.route('/next/database')
def next_database():
    return render_template('next_database.html')

@app.route('/next/ml')
def next_ml():
    return render_template('next_ml.html')

@app.route('/next/ai')
def next_ai():
    return render_template('next_ai.html')

@app.route('/next/not-sure')
def next_not_sure():
    return render_template('next_not_sure.html')

@app.route('/games')
def games():
    return render_template('games.html')

@app.route('/assessment')
def assessment():
    return render_template('assessment.html')

@app.route('/assessment/iq')
def assessment_iq():
    return render_template('iq_assessment.html')

@app.route('/assessment/skillset')
def assessment_skillset():
    return render_template('skillset_assessment.html')

@app.route('/submit-final', methods=['POST'])
def submit_final():
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400

    applicant = data.get('applicant', {})
    scores    = data.get('scores', {})
    email     = (applicant.get('email') or '').strip()
    now       = datetime.now().isoformat()

    iq       = scores.get('iq') or {}
    skillset = scores.get('skillset') or {}
    games    = scores.get('games') or {}

    score_attrs = {
        'scores_updated_at':      now,
        'iq_score':               str(iq.get('score', '')),
        'iq_total':               str(iq.get('total', '')),
        'iq_pct':                 str(iq.get('pct', '')),
        'iq_tier':                str(iq.get('tier', '')),
        'iq_percentile':          str(iq.get('percentile', '')),
        'sk_track':               str(skillset.get('track', '')),
        'sk_correct':             str(skillset.get('correct', '')),
        'sk_total':               str(skillset.get('total', '')),
        'sk_pct':                 str(skillset.get('pct', '')),
        'sk_tier':                str(skillset.get('tier', '')),
        'game_bart_profile':      str((games.get('bart') or {}).get('profile', '')),
        'game_bart_pumps_avg':    str((games.get('bart') or {}).get('avgPumps', '')),
        'game_igt_profile':       str((games.get('igt') or {}).get('profile', '')),
        'game_igt_late_good_pct': str((games.get('igt') or {}).get('lateGoodPct', '')),
        'game_he_profile':        str((games.get('he') or {}).get('profile', '')),
        'game_he_hard_pct':       str((games.get('he') or {}).get('hardPct', '')),
    }
    # Drop empty/None values — DynamoDB rejects empty strings
    score_attrs = {k: v for k, v in score_attrs.items() if v and v != 'None'}

    # ── Update DynamoDB: find the latest application record for this email ──────
    dynamo_ok = False
    if email:
        try:
            table = get_dynamo_table()

            # Query all items for this email that are application records
            resp  = table.query(
                KeyConditionExpression=Key('email').eq(email)
                    & Key('submission_type#timestamp').begins_with('application#')
            )
            items = resp.get('Items', [])

            if items:
                # Pick the most recently submitted application
                latest   = sorted(items, key=lambda x: x.get('submitted_at', ''))[-1]
                sort_key = latest['submission_type#timestamp']

                update_expr  = 'SET ' + ', '.join(f'#{k} = :{k}' for k in score_attrs)
                expr_names   = {f'#{k}': k for k in score_attrs}
                expr_values  = {f':{k}': v for k, v in score_attrs.items()}

                table.update_item(
                    Key={'email': email, 'submission_type#timestamp': sort_key},
                    UpdateExpression=update_expr,
                    ExpressionAttributeNames=expr_names,
                    ExpressionAttributeValues=expr_values
                )
                print(f"[DynamoDB] Scores updated for {email} on record {sort_key}")
                dynamo_ok = True
            else:
                # No application record found — store scores as a standalone item
                table.put_item(Item={
                    'email': email,
                    'submission_type#timestamp': f'scores#{now}',
                    **score_attrs
                })
                print(f"[DynamoDB] Scores saved as standalone item for {email}")
                dynamo_ok = True

        except ClientError as e:
            print(f"[DynamoDB ERROR] {e.response['Error']['Code']}: {e.response['Error']['Message']}")
        except Exception as e:
            print(f"[DynamoDB ERROR] {e}")

    # ── Local JSON backup ───────────────────────────────────────────────────────
    if not os.path.exists('saved_applications'):
        os.makedirs('saved_applications')
    safe_email = email.replace('@', '_at_') or 'unknown'
    filename = f"saved_applications/final_{safe_email}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump({'email': email, 'scores': scores, 'saved_at': now}, f, indent=2)

    return jsonify({'status': 'success', 'dynamo': dynamo_ok})

@app.route('/confirmation')
def confirmation():
    return render_template('confirmation.html')

@app.route('/assessment/skill')
def assessment_skill():
    return render_template('skill_selection.html')

@app.route('/assessment/skill/ml')
def assessment_skill_ml():
    return render_template('skill_test.html', test_type='ml')

@app.route('/assessment/skill/db')
def assessment_skill_db():
    return render_template('skill_test.html', test_type='db')


if __name__ == '__main__':
    app.run(debug=True)
