"""
TalentForge Applicant System — Lambda Handler
Endpoints:
  POST /submit           — submit application (duplicate check + DynamoDB put)
  POST /get-upload-url   — generate S3 presigned URL for CV upload
  POST /submit-final     — update DynamoDB record with assessment scores
  GET  /admin/applications      — list all applications
  GET  /admin/applications/{id} — get single application by email+timestamp
"""

import json
import os
import html as html_lib
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from datetime import datetime
import csv
import io

DYNAMO_TABLE = os.environ.get('DYNAMODB_TABLE', 'applicant-submissions-dev')
CV_BUCKET    = os.environ.get('CV_BUCKET', '')
AWS_REGION   = os.environ.get('AWS_REGION', 'ap-south-1')
ADMIN_USER   = os.environ.get('ADMIN_USER', 'admin')
ADMIN_PASS   = os.environ.get('ADMIN_PASS', 'admin123')
AUTH_COOKIE  = "admin_session=authenticated; Path=/; HttpOnly; Secure; SameSite=Lax"

def html_esc(value):
    """Escape user-supplied values before inserting into HTML responses."""
    if value is None:
        return '—'
    return html_lib.escape(str(value), quote=True)


dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
s3       = boto3.client('s3', region_name=AWS_REGION)
table    = dynamodb.Table(DYNAMO_TABLE)


# ── Helpers ────────────────────────────────────────────────────────────────────

def resp(status, body, headers=None):
    h = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Pass',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    }
    if headers:
        h.update(headers)
    return {
        'statusCode': status,
        'headers': h,
        'body': json.dumps(body),
    }


def parse_body(event):
    headers = event.get('headers') or {}
    # Case-insensitive header lookup
    ct = next((v for k, v in headers.items() if k.lower() == 'content-type'), '')
    
    body = event.get('body') or ''
    if isinstance(body, str) and event.get('isBase64Encoded'):
        import base64
        body = base64.b64decode(body).decode('utf-8')

    if 'application/json' in ct.lower():
        try:
            return json.loads(body) if body else {}
        except:
            pass

    # form-urlencoded
    from urllib.parse import parse_qs
    parsed = parse_qs(body, keep_blank_values=True)
    return {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}


def multilist_from(data, key):
    val = data.get(key, [])
    if isinstance(val, list):
        return ', '.join(val)
    return val


def strip_empty(d):
    """Remove keys with empty/None values — DynamoDB rejects empty strings."""
    return {k: v for k, v in d.items() if v is not None and v != '' and v != 'None'}


def check_auth(event):
    # Support both REST API (headers['cookie']) and HTTP API (event['cookies'])
    h = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    cookie_header = h.get('cookie', '')
    
    # event['cookies'] is a list in HTTP API payload 2.0
    v2_cookies = event.get('cookies') or []
    v2_cookie_str = "; ".join(v2_cookies)
    
    full_cookie_context = f"{cookie_header}; {v2_cookie_str}"
    
    # Support direct header or query parameter for Excel/CSV links
    qs = event.get('queryStringParameters') or {}
    auth_header = h.get('x-admin-pass', '')
    pass_param = qs.get('pass', '')
    
    # Support both cookie and direct header/param for flexibility
    if "admin_session=authenticated" in full_cookie_context:
        return True
    if auth_header == ADMIN_PASS or pass_param == ADMIN_PASS:
        return True
        
    return False


# ── Route: POST /login ─────────────────────────────────────────────────────────

def handle_login(event):
    data = parse_body(event)
    user = (data.get('username') or '').strip()
    pw   = (data.get('password') or '').strip()

    if user == ADMIN_USER and pw == ADMIN_PASS:
        return resp(200, {'status': 'success'}, headers={'Set-Cookie': AUTH_COOKIE})
    return resp(401, {'status': 'error', 'message': 'Invalid credentials'})


def handle_logout(event):
    return resp(200, {'status': 'success'}, headers={'Set-Cookie': 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'})


# ── Route: POST /submit ────────────────────────────────────────────────────────

def handle_submit(event):
    data  = parse_body(event)
    email = data.get('email', '').strip()

    if not email:
        return resp(400, {'status': 'error', 'message': 'Email is required'})

    # Duplicate check
    try:
        result = table.query(
            KeyConditionExpression=Key('email').eq(email)
        )
        existing = [
            item for item in result.get('Items', [])
            if str(item.get('submission_type#timestamp', '')).startswith('application#')
        ]
        if existing:
            return resp(409, {
                'status': 'duplicate',
                'message': f'An application from {email} already exists.',
                'email': email,
            })
    except ClientError as e:
        print(f"[DynamoDB duplicate check error] {e}")
        # fall through — allow submission if DynamoDB is unreachable

    submitted_at = datetime.utcnow().isoformat()
    cv_key = data.get('cv_key', '')  # S3 key set by frontend after presigned upload

    item = {
        'email':                     email,
        'submission_type#timestamp': f'application#{submitted_at}',
        'submitted_at':              submitted_at,
        'submission_type':           'application',
        'full_name':        data.get('full_name', ''),
        'country_code':     data.get('country_code', ''),
        'phone':            data.get('phone', ''),
        'location_country': data.get('location_country', ''),
        'other_country':    data.get('other_country', ''),
        'location':         data.get('location', ''),
        'linkedin':         data.get('linkedin', ''),
        'current_role':     data.get('current_role', ''),
        'current_company':  data.get('current_company', ''),
        'experience':       data.get('experience', ''),
        'degree':           data.get('degree', ''),
        'field':            data.get('field', ''),
        'university':       data.get('university', ''),
        'cv_key':           cv_key,
        'portfolio':        data.get('portfolio', ''),
        'github':           data.get('github', ''),
        'website':          data.get('website', ''),
        'work_type':        data.get('work_type', ''),
        'start_date':       data.get('start_date', ''),
        'work_preference':  data.get('work_preference', ''),
        'constraints':      data.get('constraints', ''),
        'interest':         data.get('interest', ''),
        'problems':         data.get('problems', ''),
        'area':             data.get('area', ''),
        'skills':           multilist_from(data, 'skills'),
        'source':           data.get('source', ''),
        'other_source':     data.get('other_source', ''),
        # DB specialization
        'db_databases':     multilist_from(data, 'db_databases'),
        'db_query_tools':   multilist_from(data, 'db_query_tools'),
        'other_query_tool': data.get('other_query_tool', ''),
        'db_backend_langs': multilist_from(data, 'db_backend_langs'),
        'db_experience':    data.get('db_experience', ''),
        'db_optimized':     data.get('db_optimized', ''),
        'db_desc':          data.get('db_desc', ''),
        # ML specialization
        'ml_libs':          multilist_from(data, 'ml_libs'),
        'ml_fin_data':      multilist_from(data, 'ml_fin_data'),
        'other_ml_fin_data': data.get('other_ml_fin_data', ''),
        'ml_concepts':      multilist_from(data, 'ml_concepts'),
        'other_ml_concept': data.get('other_ml_concept', ''),
        'ml_experience':    data.get('ml_experience', ''),
        'ml_built':         data.get('ml_built', ''),
        'ml_desc':          data.get('ml_desc', ''),
        # AI specialization
        'ai_tools':         multilist_from(data, 'ai_tools'),
        'ai_areas':         multilist_from(data, 'ai_areas'),
        'other_ai_area':    data.get('other_ai_area', ''),
        'ai_langs':         multilist_from(data, 'ai_langs'),
        'ai_experience':    data.get('ai_experience', ''),
        'ai_deployed':      data.get('ai_deployed', ''),
        'ai_desc':          data.get('ai_desc', ''),
    }

    item = strip_empty(item)

    try:
        table.put_item(Item=item)
        print(f"[DynamoDB] Saved application for {email}")
    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to save application'})

    area = data.get('area', '')
    next_page = {
        'database': 'next_database.html',
        'ml':       'next_ml.html',
        'ai':       'next_ai.html',
    }.get(area, 'next_not_sure.html')

    return resp(200, {
        'status': 'success',
        'email':  email,
        'next':   'iq_assessment.html',
    })


# ── Route: POST /get-upload-url ────────────────────────────────────────────────

def handle_get_upload_url(event):
    data      = parse_body(event)
    full_name = (data.get('full_name') or 'applicant').replace(' ', '_')
    filename  = data.get('filename', 'cv.pdf')
    ext       = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'pdf'
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    s3_key    = f"cvs/{full_name}_{timestamp}_CV.{ext}"

    content_type_map = {
        'pdf':  'application/pdf',
        'doc':  'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    content_type = content_type_map.get(ext, 'application/octet-stream')

    try:
        url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket':      CV_BUCKET,
                'Key':         s3_key,
                'ContentType': content_type,
            },
            ExpiresIn=300,  # 5 minutes
        )
        return resp(200, {'status': 'success', 'url': url, 'key': s3_key})
    except ClientError as e:
        print(f"[S3 presign error] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to generate upload URL'})


# ── Route: POST /submit-final ──────────────────────────────────────────────────

def handle_submit_final(event):
    data      = parse_body(event)
    applicant = data.get('applicant', {})
    scores    = data.get('scores', {})
    email     = (applicant.get('email') or '').strip()
    now       = datetime.utcnow().isoformat()

    if not email:
        return resp(400, {'status': 'error', 'message': 'Email required'})

    iq       = scores.get('iq') or {}
    skillset = scores.get('skillset') or {}
    games    = scores.get('games') or {}

    score_attrs = strip_empty({
        'scores_updated_at':      now,
        'iq_score':               str(iq.get('score', '')),
        'iq_total':               str(iq.get('total', '')),
        'iq_pct':                 str(iq.get('pct', '')),
        'iq_tier':                str(iq.get('tier', '')),
        'iq_percentile':          str(iq.get('percentile', '')),
        'iq_time_taken':          str(iq.get('time_taken', '')),
        'iq_responses':           json.dumps(iq.get('responses', [])),
        'sk_track':               str(skillset.get('track', '')),
        'sk_correct':             str(skillset.get('correct', '')),
        'sk_total':               str(skillset.get('total', '')),
        'sk_pct':                 str(skillset.get('pct', '')),
        'sk_tier':                str(skillset.get('tier', '')),
        'sk_time_taken':          str(skillset.get('time_taken', '')),
        'sk_responses':           json.dumps(skillset.get('responses', [])),
        'game_bart_profile':      str((games.get('bart') or {}).get('profile', '')),
        'game_bart_pumps_avg':    str((games.get('bart') or {}).get('avg_pumps', '')),
        'game_bart_responses':    json.dumps((games.get('bart') or {}).get('responses', [])),
        'game_igt_profile':       str((games.get('igt') or {}).get('profile', '')),
        'game_igt_late_good_pct': str((games.get('igt') or {}).get('good_pct', '')),
        'game_igt_responses':     json.dumps((games.get('igt') or {}).get('responses', [])),
        'game_he_profile':        str((games.get('he') or {}).get('profile', '')),
        'game_he_hard_pct':       str((games.get('he') or {}).get('hard_pct', '')),
        'game_he_responses':      json.dumps((games.get('he') or {}).get('responses', {})),
        'game_time_taken':        str(games.get('time_taken', '')),
    })

    if not score_attrs:
        return resp(400, {'status': 'error', 'message': 'No score data provided'})

    try:
        # Find latest application record for this email
        result = table.query(
            KeyConditionExpression=Key('email').eq(email)
                & Key('submission_type#timestamp').begins_with('application#')
        )
        items = result.get('Items', [])

        if items:
            latest   = sorted(items, key=lambda x: x.get('submitted_at', ''))[-1]
            sort_key = latest['submission_type#timestamp']

            update_expr = 'SET ' + ', '.join(f'#{k} = :{k}' for k in score_attrs)
            expr_names  = {f'#{k}': k for k in score_attrs}
            expr_values = {f':{k}': v for k, v in score_attrs.items()}

            table.update_item(
                Key={'email': email, 'submission_type#timestamp': sort_key},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values,
            )
            print(f"[DynamoDB] Scores updated for {email}")
        else:
            # No application record — store scores standalone
            table.put_item(Item={
                'email':                     email,
                'submission_type#timestamp': f'scores#{now}',
                'submission_type':           'scores',
                **score_attrs,
            })
            print(f"[DynamoDB] Scores stored standalone for {email}")

        return resp(200, {'status': 'success'})

    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to save scores'})


# ── Route: GET /admin/applications ─────────────────────────────────────────────

def handle_admin_list(event):
    qs = event.get('queryStringParameters') or {}
    is_json = qs.get('json') == '1'

    try:
        result = table.query(
            IndexName='submission-type-index',
            KeyConditionExpression=Key('submission_type').eq('application'),
            ScanIndexForward=False,
            Limit=200,
        )
        items = result.get('Items', [])
        
        # Mapping for frontend consistency
        all_dates = set()
        all_locations = set()
        all_areas = set()

        for item in items:
            # Safe ID generation
            email_key = item.get('email', 'unknown')
            ts_key = item.get('submission_type#timestamp', 'unknown')
            item['id'] = f"{email_key}__{ts_key}"
            
            # Mapping for frontend consistency with safe defaults
            item['tech_score'] = str(item.get('sk_correct', '0'))
            item['game_balloon'] = str(item.get('game_bart_pumps_avg', '0'))
            item['game_height'] = str(item.get('game_he_hard_pct', '0'))
            item['game_iq'] = str(item.get('game_igt_late_good_pct', '0'))
            
            s_at = item.get('submitted_at')
            if s_at and isinstance(s_at, str) and len(s_at) >= 10:
                all_dates.add(s_at[:10])
            
            if item.get('location_country'): all_locations.add(item['location_country'])
            if item.get('area'): all_areas.add(item['area'])

        if is_json:
            return resp(200, {
                'applications': items,
                'options': {
                    'dates': sorted(list(all_dates), reverse=True),
                    'location': sorted(list(all_locations)),
                    'area': sorted(list(all_areas))
                },
                'filters': {
                    'date_filter': qs.get('date_filter', ''),
                    'location_filter': qs.get('location_filter', ''),
                    'area': qs.get('area', ''),
                    'search': qs.get('search', '')
                }
            })

    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to fetch applications'})

    rows = ''.join(
        f"<tr>"
        f"<td>{i+1}</td>"
        f"<td>{html_esc(item.get('submitted_at',''))[:19]}</td>"
        f"<td>{html_esc(item.get('full_name'))}</td>"
        f"<td>{html_esc(item.get('email'))}</td>"
        f"<td>{html_esc(item.get('area'))}</td>"
        f"<td>{html_esc(item.get('experience'))}</td>"
        f"<td>{html_esc(item.get('location_country'))}</td>"
        f"</tr>"
        for i, item in enumerate(items)
    )

    html = f"""<!DOCTYPE html><html><head><title>Applications — TalentForge</title>
    <style>
      body{{font-family:monospace;padding:24px;background:#0d1b2e;color:#c2d7f2}}
      h2{{color:#00d4ff}}
      table{{border-collapse:collapse;width:100%}}
      th,td{{border:1px solid #2a3f60;padding:8px 12px;text-align:left}}
      th{{background:#1a2f4e;color:#00d4ff}}
      tr:nth-child(even){{background:#111e30}}
    </style></head><body>
    <h2>Submitted Applications ({len(items)})</h2>
    <table>
      <tr><th>#</th><th>Submitted</th><th>Name</th><th>Email</th><th>Area</th><th>Exp.</th><th>Country</th></tr>
      {rows if rows else '<tr><td colspan=7>No submissions yet.</td></tr>'}
    </table></body></html>"""

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
        'body': html,
    }


def handle_admin_detail(event):
    qs = event.get('queryStringParameters') or {}
    record_id = qs.get('id', '')
    if not record_id:
        # Check path parameter if not in QS
        path_params = event.get('pathParameters') or {}
        record_id   = path_params.get('id', '')

    from urllib.parse import unquote
    record_id = unquote(record_id)
    if '__' not in record_id:
        return resp(400, {'status': 'error', 'message': f'Invalid id format: {record_id}'})

    email, sort_key = record_id.split('__', 1)

    try:
        result = table.get_item(Key={
            'email': email,
            'submission_type#timestamp': sort_key,
        })
        item = result.get('Item')
    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to fetch application'})

    if not item:
        return resp(404, {'status': 'error', 'message': 'Not found'})

    item['id'] = record_id
    item['tech_score'] = str(item.get('sk_correct', '0'))
    item['game_balloon'] = str(item.get('game_bart_pumps_avg', '0'))
    item['game_height'] = str(item.get('game_he_hard_pct', '0'))
    item['game_iq'] = str(item.get('game_igt_late_good_pct', '0'))

    if qs.get('json') == '1':
        return resp(200, {'app': item})

    rows = ''.join(
        f"<tr><td><strong>{html_esc(k)}</strong></td><td>{html_esc(item[k])}</td></tr>"
        for k in sorted(item.keys())
    )
    html = f"""<!DOCTYPE html><html><head><title>Application — {html_esc(item.get('full_name',''))}</title>
    <style>
      body{{font-family:monospace;padding:24px;background:#0d1b2e;color:#c2d7f2}}
      h2{{color:#00d4ff}}
      table{{border-collapse:collapse;width:100%}}
      td{{border:1px solid #2a3f60;padding:8px 12px}}
      tr:nth-child(even){{background:#111e30}}
      td:first-child{{color:#00d4ff;width:220px}}
      a{{color:#00d4ff}}
    </style></head><body>
    <a href="/admin.html">← Back</a>
    <h2>Application — {html_esc(item.get('full_name','Unknown'))}</h2>
    <table>{rows}</table></body></html>"""

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
        'body': html,
    }


# Field mapping for CSV exports (Internal Key -> User Friendly Header)
CSV_FIELD_MAPPING = {
    'submitted_at': 'Submission Date',
    'full_name': 'Full Name',
    'email': 'Email',
    'phone': 'Phone',
    'location': 'City',
    'location_country': 'Country',
    'area': 'Track/Area',
    'current_role': 'Current Role',
    'current_company': 'Current Company',
    'experience': 'Years of Exp',
    'degree': 'Degree',
    'field': 'Field of Study',
    'university': 'University',
    'iq_score': 'IQ Score',
    'sk_correct': 'Tech Score (Correct)',
    'sk_pct': 'Tech Accuracy (%)',
    'game_bart_pumps_avg': 'BART Avg Pumps (Balloon)',
    'game_igt_late_good_pct': 'IGT Good Pct (IQ/Behavioral)',
    'game_he_hard_pct': 'HE Hard Pct (Height)',
    'skills': 'Skills',
    'source': 'Source',
    'interest': 'Interest/Motivation',
    'linkedin': 'LinkedIn',
    'github': 'GitHub',
    'portfolio': 'Portfolio',
    'website': 'Website',
    'work_type': 'Work Type',
    'work_preference': 'Work Preference',
    'start_date': 'Start Date',
    'constraints': 'Constraints',
    'problems': 'Solving Style/Extra Info',
    # DB Specialization
    'db_databases': 'DB: Databases',
    'db_query_tools': 'DB: Query Tools',
    'db_backend_langs': 'DB: Backend Langs',
    'db_experience': 'DB: Experience Category',
    'db_optimized': 'DB: Optimization Exp',
    'db_desc': 'DB: Project Description',
    # ML Specialization
    'ml_libs': 'ML: Libraries',
    'ml_fin_data': 'ML: Financial Data Exp',
    'ml_concepts': 'ML: Concepts',
    'ml_experience': 'ML: Experience Category',
    'ml_built': 'ML: Models Built',
    'ml_desc': 'ML: Project Description',
    # AI Specialization
    'ai_tools': 'AI: Tools',
    'ai_areas': 'AI: Areas',
    'ai_langs': 'AI: Languages',
    'ai_experience': 'AI: Experience Category',
    'ai_deployed': 'AI: Deployed Models',
    'ai_desc': 'AI: Project Description',
    'cv_key': 'CV Download link'
}

def handle_admin_export(event):
    items = []
    last_key = None
    
    try:
        # Fetch ALL records using pagination (LastEvaluatedKey)
        while True:
            query_params = {
                'IndexName': 'submission-type-index',
                'KeyConditionExpression': Key('submission_type').eq('application'),
                'ScanIndexForward': False,
            }
            if last_key:
                query_params['ExclusiveStartKey'] = last_key
                
            result = table.query(**query_params)
            items.extend(result.get('Items', []))
            
            last_key = result.get('LastEvaluatedKey')
            if not last_key:
                break
                
            # Safety break to avoid infinite loops in case of unexpected DynamoDB behavior
            if len(items) > 10000:
                print("[Admin Export] Safety limit of 10k records reached.")
                break
                
    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': f'Failed to fetch applications for export: {str(e)}'})

    if not items:
        return resp(400, {'status': 'error', 'message': 'No data to export'})

    output = io.StringIO()
    # Add UTF-8 BOM for Excel
    output.write('\ufeff')
    writer = csv.writer(output)
    
    # Determine columns based on mapping + any extra fields found in the data
    mapped_keys = list(CSV_FIELD_MAPPING.keys())
    all_keys = set()
    for item in items:
        all_keys.update(item.keys())
    
    # Sort columns: mapped first in their defined order, then any leftovers
    extra_keys = sorted(list(all_keys - set(mapped_keys)))
    final_keys = mapped_keys + extra_keys
    
    # Write Header with user-friendly names where available
    headers = [CSV_FIELD_MAPPING.get(k, k) for k in final_keys]
    writer.writerow(headers)
    
    # Use the hardcoded CloudFront domain for reliability in exports
    base_url = "https://ddlcgice0qu4d.cloudfront.net"

    # Write Rows
    for item in items:
        row = []
        for k in final_keys:
            val = item.get(k, '')
            # Clean up T in timestamps for better CSV readability
            if k == 'submitted_at' and isinstance(val, str):
                val = val.replace('T', ' ')[:19]
            # Convert CV key to downloadable URL with fallback auth for Excel/Sheets
            if k == 'cv_key' and val:
                # Adding ?pass= fallback ensures the link works in external apps like Excel
                val = f"{base_url}/admin/cv/{val}?pass={ADMIN_PASS}"
            row.append(val)
        writer.writerow(row)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename=applicants_full_export.csv',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Pass,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        },
        'body': output.getvalue()
    }


def handle_cv_view(event):
    """Generate a presigned URL to view a CV and redirect."""
    # Robust path detection for both HTTP API (v2) and REST API (v1)
    raw_path = event.get('rawPath') or event.get('path') or ''
    path = raw_path.strip()
    
    # Strip stage prefix (e.g. /dev/submit → /submit)
    stage = (event.get('requestContext', {}).get('stage') or '').strip('/')
    if stage and stage != '$default':
        if path.startswith(f'/{stage}'):
            path = path[len(f'/{stage}'):]
    
    # Normalize path: remove trailing slash for easier matching
    if path.endswith('/') and len(path) > 1:
        path = path[:-1]
    
    if not path:
        path = '/'

    cv_key = path.replace('/admin/cv/', '', 1)
    
    if not cv_key or not CV_BUCKET:
        return resp(404, {'status': 'error', 'message': f'CV key not found in path: {path}'})

    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': CV_BUCKET, 'Key': cv_key},
            ExpiresIn=300
        )
        print(f"[CV View] HTML Redirect to: {url[:60]}...")
        
        # Using HTML Meta-refresh to bypass infrastructure header stripping
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url={url}">
    <title>Redirecting to CV...</title>
    <style>
        body {{ font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0d1b2e; color: #fff; margin: 0; }}
        .box {{ text-align: center; padding: 20px; border: 1px solid #00d4ff; border-radius: 12px; }}
        a {{ color: #00d4ff; text-decoration: none; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="box">
        <p>Redirecting to CV...</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">If not redirected, <a href="{url}">click here to download</a>.</p>
    </div>
</body>
</html>"""
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            },
            'body': html
        }
    except Exception as e:
        print(f"[S3 ERROR] {e}")
        return resp(500, {'status': 'error', 'message': f'Failed to generate CV link: {str(e)}'})


# ── Router ─────────────────────────────────────────────────────────────────────

def lambda_handler(event, context):
    try:
        return _lambda_handler(event, context)
    except Exception as e:
        import traceback
        print(f"[FATAL ERROR] {e}\n{traceback.format_exc()}")
        return resp(500, {
            'status': 'error',
            'message': f"Fatal Handler Exception: {str(e)}",
            'traceback': traceback.format_exc()
        })

def _lambda_handler(event, context):
    path = event.get('rawPath') or event.get('path') or '/'
    method = (event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method', '')).upper()
    print(f"[ENTRY] {method} {path}")
    
    # Support both HTTP API (v2) and REST API (v1)
    
    # Robust path detection
    path = event.get('rawPath') or event.get('path') or ''
    
    # Strip stage prefix (e.g. /dev/submit → /submit)
    stage = (event.get('requestContext', {}).get('stage') or '').strip('/')
    if stage and stage != '$default':
        if path.startswith(f'/{stage}'):
            path = path[len(f'/{stage}'):]

    # Normalize path: remove trailing slash for easier matching
    if path.endswith('/') and len(path) > 1:
        path = path[:-1]

    if not path:
        path = '/'

    # Normalize for routing
    target = path.lower().strip('/')
    if not target: target = 'root'

    if method == 'OPTIONS':
        return resp(200, {})

    if target == 'submit' and method == 'POST':
        return handle_submit(event)

    if target == 'get-upload-url' and method == 'POST':
        return handle_get_upload_url(event)

    if target == 'submit-final' and method == 'POST':
        return handle_submit_final(event)

    if target == 'login' and method == 'POST':
        return handle_login(event)

    if target == 'logout':
        return handle_logout(event)

    # ── Admin Routes ─────────────────────────────────────────────────────────

    if target == 'admin/applications/export' or target == 'admin/export/csv' or target == 'admin/export':
        if not check_auth(event): return resp(401, {'status': 'unauthorized'})
        return handle_admin_export(event)

    if target == 'admin/applications':
        if not check_auth(event): return resp(401, {'status': 'unauthorized'})
        return handle_admin_list(event)

    if target.startswith('admin/applications/') or target.startswith('admin/application'):
        if not check_auth(event): return resp(401, {'status': 'unauthorized'})
        
        # Handle /admin/applications/{id} or /admin/application/{id}
        seg = ''
        if '/admin/applications/' in path:
            seg = path.split('/admin/applications/')[1].strip('/')
        elif '/admin/application/' in path:
            seg = path.split('/admin/application/')[1].strip('/')
        
        if seg:
            event = dict(event)
            qs = dict(event.get('queryStringParameters') or {})
            qs['id'] = seg
            event['queryStringParameters'] = qs
            
        return handle_admin_detail(event)

    if target.startswith('admin/cv/'):
        if not check_auth(event): return resp(401, {'status': 'unauthorized'})
        return handle_cv_view(event)

    # Log for CloudWatch
    err_msg = f"Route not found: {method} {target}"
    return resp(404, {'status': 'error', 'message': err_msg})
