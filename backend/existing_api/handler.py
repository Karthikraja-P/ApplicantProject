"""
Singularity Applicant System — Lambda Handler
Endpoints:
  POST /submit           — submit application (duplicate check + DynamoDB put)
  POST /get-upload-url   — generate S3 presigned URL for CV upload
  POST /submit-final     — update DynamoDB record with assessment scores
  GET  /admin/applications      — list all applications
  GET  /admin/applications/{id} — get single application by email+timestamp
"""

import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from datetime import datetime

DYNAMO_TABLE = os.environ.get('DYNAMODB_TABLE', 'applicant-submissions-dev')
CV_BUCKET    = os.environ.get('CV_BUCKET', '')
AWS_REGION   = os.environ.get('AWS_REGION', 'ap-south-1')

dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
s3       = boto3.client('s3', region_name=AWS_REGION)
table    = dynamodb.Table(DYNAMO_TABLE)


# ── Helpers ────────────────────────────────────────────────────────────────────

def resp(status, body, headers=None):
    h = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    ct = (event.get('headers') or {}).get('content-type', '')
    body = event.get('body') or ''
    if isinstance(body, str) and event.get('isBase64Encoded'):
        import base64
        body = base64.b64decode(body).decode('utf-8')

    if 'application/json' in ct:
        return json.loads(body) if body else {}

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
        # DB specialization
        'db_databases':     multilist_from(data, 'db_databases'),
        'db_query_tools':   multilist_from(data, 'db_query_tools'),
        'db_backend_langs': multilist_from(data, 'db_backend_langs'),
        'db_experience':    data.get('db_experience', ''),
        'db_optimized':     data.get('db_optimized', ''),
        'db_desc':          data.get('db_desc', ''),
        # ML specialization
        'ml_libs':          multilist_from(data, 'ml_libs'),
        'ml_fin_data':      multilist_from(data, 'ml_fin_data'),
        'ml_concepts':      multilist_from(data, 'ml_concepts'),
        'ml_experience':    data.get('ml_experience', ''),
        'ml_built':         data.get('ml_built', ''),
        'ml_desc':          data.get('ml_desc', ''),
        # AI specialization
        'ai_tools':         multilist_from(data, 'ai_tools'),
        'ai_areas':         multilist_from(data, 'ai_areas'),
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
    try:
        result = table.query(
            IndexName='submission-type-index',
            KeyConditionExpression=Key('submission_type').eq('application'),
            ScanIndexForward=False,
            Limit=200,
        )
        items = result.get('Items', [])
    except ClientError as e:
        print(f"[DynamoDB ERROR] {e}")
        return resp(500, {'status': 'error', 'message': 'Failed to fetch applications'})

    rows = ''.join(
        f"<tr>"
        f"<td>{i+1}</td>"
        f"<td>{item.get('submitted_at','')[:19]}</td>"
        f"<td>{item.get('full_name','—')}</td>"
        f"<td>{item.get('email','—')}</td>"
        f"<td>{item.get('area','—')}</td>"
        f"<td>{item.get('experience','—')}</td>"
        f"<td>{item.get('location_country','—')}</td>"
        f"</tr>"
        for i, item in enumerate(items)
    )

    html = f"""<!DOCTYPE html><html><head><title>Applications — Singularity</title>
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
    path_params = event.get('pathParameters') or {}
    record_id   = path_params.get('id', '')
    # id format: email__sortkey (URL-encoded)
    from urllib.parse import unquote
    record_id = unquote(record_id)

    if '__' not in record_id:
        return resp(400, {'status': 'error', 'message': 'Invalid id format'})

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

    rows = ''.join(
        f"<tr><td><strong>{k}</strong></td><td>{item[k]}</td></tr>"
        for k in sorted(item.keys())
    )
    html = f"""<!DOCTYPE html><html><head><title>Application — {item.get('full_name','')}</title>
    <style>
      body{{font-family:monospace;padding:24px;background:#0d1b2e;color:#c2d7f2}}
      h2{{color:#00d4ff}}
      table{{border-collapse:collapse;width:100%}}
      td{{border:1px solid #2a3f60;padding:8px 12px}}
      tr:nth-child(even){{background:#111e30}}
      td:first-child{{color:#00d4ff;width:220px}}
      a{{color:#00d4ff}}
    </style></head><body>
    <a href="/admin/applications">← Back</a>
    <h2>Application — {item.get('full_name','Unknown')}</h2>
    <table>{rows}</table></body></html>"""

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'},
        'body': html,
    }


# ── Router ─────────────────────────────────────────────────────────────────────

def lambda_handler(event, context):
    method = event.get('requestContext', {}).get('http', {}).get('method', '').upper()
    path   = event.get('rawPath', '')

    # Strip stage prefix (e.g. /dev/submit → /submit)
    stage = (event.get('requestContext', {}).get('stage') or '').strip('/')
    if stage and path.startswith(f'/{stage}'):
        path = path[len(f'/{stage}'):]
    if not path:
        path = '/'

    print(f"[{method}] {path}")

    if method == 'OPTIONS':
        return resp(200, {})

    if path == '/submit' and method == 'POST':
        return handle_submit(event)

    if path == '/get-upload-url' and method == 'POST':
        return handle_get_upload_url(event)

    if path == '/submit-final' and method == 'POST':
        return handle_submit_final(event)

    if path == '/admin/applications' and method == 'GET':
        return handle_admin_list(event)

    if path.startswith('/admin/applications/') and method == 'GET':
        return handle_admin_detail(event)

    return resp(404, {'status': 'error', 'message': f'Route not found: {method} {path}'})
