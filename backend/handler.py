import json
import os
import boto3
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Configuration from environment variables
DYNAMO_TABLE = os.environ.get('DYNAMO_TABLE', 'applicant-submissions-dev')
S3_BUCKET    = os.environ.get('S3_UPLOAD_BUCKET', 'singularity-uploads-dev')
AWS_REGION   = os.environ.get('AWS_REGION', 'ap-south-1')

s3_client = boto3.client('s3', region_name=AWS_REGION)
dynamodb  = boto3.resource('dynamodb', region_name=AWS_REGION)
table     = dynamodb.Table(DYNAMO_TABLE)

def response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', # Enable CORS for all
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body)
    }

def handler(event, context):
    print(f"Event: {json.dumps(event)}")
    
    resource = event.get('resource')
    method   = event.get('httpMethod')
    
    # CORS Preflight
    if method == 'OPTIONS':
        return response(200, {})
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        if resource == '/upload-url' and method == 'POST':
            return handle_upload_url(body)
        elif resource == '/save' and method == 'POST':
            return handle_save(body)
        elif resource == '/submit' and method == 'POST':
            return handle_submit(body)
        else:
            return response(404, {'error': 'Not Found'})
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {'error': str(e)})

def handle_upload_url(body):
    filename     = body.get('filename')
    content_type = body.get('content_type', 'application/pdf')
    email        = body.get('email', 'unknown').replace('@', '_at_')
    
    if not filename:
        return response(400, {'error': 'Filename is required'})
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_key  = f"uploads/{email}/{timestamp}_{filename}"
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': file_key,
                'ContentType': content_type
            },
            ExpiresIn=3600
        )
        return response(200, {
            'upload_url': presigned_url,
            'file_key': file_key
        })
    except ClientError as e:
        return response(500, {'error': str(e)})

def handle_save(body):
    email = body.get('email')
    if not email:
        return response(400, {'error': 'Email is required for saving drafts'})
    
    # Check if we are saving an assessment result
    assessment_type = body.get('assessment_type')
    assessment_results = body.get('assessment_results')
    
    if assessment_type and assessment_results:
        # Update draft with assessment results
        try:
            table.update_item(
                Key={'email': email, 'submission_id': 'draft'},
                UpdateExpression=f"SET assessments.{assessment_type} = :val, updated_at = :now",
                ExpressionAttributeValues={
                    ':val': assessment_results,
                    ':now': datetime.now().isoformat()
                }
            )
            return response(200, {'status': 'success', 'message': f'{assessment_type} results saved to draft'})
        except ClientError as e:
            # If draft doesn't exist yet, we might need to create it
            # But normally the form draft exists first.
            return response(500, {'error': str(e)})
    
    # Otherwise saving a general form draft
    draft_data = body.get('draft', {})
    draft_data['updated_at'] = datetime.now().isoformat()
    
    try:
        table.put_item(
            Item={
                'email': email,
                'submission_id': 'draft',
                'data': draft_data
            }
        )
        return response(200, {'status': 'success', 'message': 'Draft saved'})
    except ClientError as e:
        return response(500, {'error': str(e)})

def handle_submit(body):
    email = body.get('email')
    if not email:
        return response(400, {'error': 'Email is required'})
    
    # Check for existing final submission
    try:
        existing = table.get_item(Key={'email': email, 'submission_id': 'final'})
        if 'Item' in existing:
            return response(400, {'error': 'already_applied'})
            
        # Prepare final item
        item = body
        item['submission_id'] = 'final'
        item['submitted_at']  = datetime.now().isoformat()
        
        table.put_item(Item=item)
        
        # Optionally delete draft
        table.delete_item(Key={'email': email, 'submission_id': 'draft'})
        
        return response(200, {'status': 'success', 'message': 'Application submitted successfully'})
        
    except ClientError as e:
        return response(500, {'error': str(e)})
