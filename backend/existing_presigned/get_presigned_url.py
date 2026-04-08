import json
import os
import boto3
from typing import Dict, Optional

s3_client = boto3.client('s3')

# Environment variables
S3_BUCKET = os.getenv("S3_BUCKET", "pitchdesk-profile-pictures-321161022008")
PRESIGNED_URL_EXPIRATION = int(os.getenv("PRESIGNED_URL_EXPIRATION", "3600"))  # 1 hour

def _normalize_headers(headers: Optional[dict]) -> dict:
    """Return a dict with lower-cased header keys for case-insensitive lookup."""
    if not headers:
        return {}
    return {k.lower(): v for k, v in headers.items()}

def _response(status_code: int, body: dict) -> dict:
    """Standard API Gateway response format"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization,tenant_id",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(body)
    }

def generate_s3_key(tenant_id: str, agent_id: str, sub_agent_id: str, filename: str) -> str:
    """
    Generate S3 key path for sub-agent profile picture
    Format: {tenant_id}/{agent_id}/{sub_agent_id}/{filename}
    
    Example: TNT_9080/AGT176148918296ca51/SUAGT1761489268526a52/profile_20241028_120000.jpg
    """
    # Construct S3 key: tenant/agent/sub_agent/filename
    s3_key = f"{tenant_id}/{agent_id}/{sub_agent_id}/{filename}"
    
    return s3_key

def generate_presigned_put_url(bucket: str, s3_key: str, content_type: str, expires_in: int) -> dict:
    """
    Generate a pre-signed PUT URL for uploading a file to S3
    """
    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket,
                'Key': s3_key,
                'ContentType': content_type
            },
            ExpiresIn=expires_in,
            HttpMethod='PUT'
        )
        
        return {
            "success": True,
            "upload_url": presigned_url,
            "s3_key": s3_key,
            "method": "PUT",
            "headers": {
                "Content-Type": content_type
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_presigned_post_url(bucket: str, s3_key: str, content_type: str, expires_in: int) -> dict:
    """
    Generate a pre-signed POST URL for uploading a file to S3
    """
    try:
        # Generate pre-signed POST URL
        presigned_post = s3_client.generate_presigned_post(
            Bucket=bucket,
            Key=s3_key,
            Fields={
                "Content-Type": content_type
            },
            Conditions=[
                {"Content-Type": content_type},
                ["content-length-range", 0, 10485760]  # Max 10MB
            ],
            ExpiresIn=expires_in
        )
        
        return {
            "success": True,
            "upload_url": presigned_post['url'],
            "fields": presigned_post['fields'],
            "s3_key": s3_key,
            "method": "POST"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def lambda_handler(event: dict, context) -> Dict:
    """
    Lambda handler for generating pre-signed URLs for sub-agent profile picture uploads
    
    Expected payload:
    {
        "tenant_id": "TNT_9080",
        "agent_id": "AGT176148918296ca51",
        "sub_agent_id": "SUAGT1761489268526a52",
        "filename": "profile.jpg",
        "content_type": "image/jpeg",
        "method": "PUT"  // Optional, defaults to PUT
    }
    """
    try:
        # Parse event
        if isinstance(event, str):
            event_obj = json.loads(event)
        elif isinstance(event, dict):
            event_obj = event
        else:
            return _response(400, {"error": "Invalid event format"})
        
        # Parse body
        body_payload = {}
        raw_body = event_obj.get('body')
        if isinstance(raw_body, str) and raw_body.strip():
            try:
                body_payload = json.loads(raw_body)
            except json.JSONDecodeError:
                return _response(400, {"error": "Invalid JSON in request body"})
        elif isinstance(raw_body, dict):
            body_payload = raw_body
        
        # Extract tenant_id from headers or body
        tenant_id = body_payload.get('tenant_id')

        # Extract required parameters
        agent_id = body_payload.get('agent_id')
        sub_agent_id = body_payload.get('sub_agent_id')
        filename = body_payload.get('filename')
        content_type = body_payload.get('content_type', 'image/jpeg')
        
        # Validate required fields
        if not tenant_id:
            return _response(400, {"error": "tenant_id is required"})
        
        if not agent_id:
            return _response(400, {"error": "agent_id is required"})
        
        if not sub_agent_id:
            return _response(400, {"error": "sub_agent_id is required"})
        
        if not filename:
            return _response(400, {"error": "filename is required"})
        
        # Validate file type (only allow images)
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        file_extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if file_extension not in allowed_extensions:
            return _response(400, {
                "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            })
        
        # Generate S3 key: tenant/agent/sub_agent/filename
        s3_key = generate_s3_key(tenant_id, agent_id, sub_agent_id, filename)
        
        print(f"Generated S3 key: {s3_key}")
        
        # Generate pre-signed URL based on method
        # if method.upper() == 'POST':
        #     result = generate_presigned_post_url(
        #         S3_BUCKET, 
        #         s3_key, 
        #         content_type, 
        #         PRESIGNED_URL_EXPIRATION
        #     )
        # else:  # Default to PUT
        result = generate_presigned_put_url(
            S3_BUCKET, 
            s3_key, 
            content_type, 
            PRESIGNED_URL_EXPIRATION
        )
        
        if not result.get('success'):
            return _response(500, {"error": result.get('error')})
        
        # Construct response
        response_data = {
            "success": True,
            "tenant_id": tenant_id,
            "agent_id": agent_id,
            "sub_agent_id": sub_agent_id,
            "upload_url": result['upload_url'],
            "s3_key": s3_key,
            "s3_bucket": S3_BUCKET,
            "method": result['method'],
            "expires_in": PRESIGNED_URL_EXPIRATION,
            "content_type": content_type
        }
        
        # Add fields for POST method
        # if method.upper() == 'POST' and 'fields' in result:
        #     response_data['fields'] = result['fields']
        
        # # Add headers for PUT method
        # if method.upper() == 'PUT' and 'headers' in result:
        response_data['headers'] = result['headers']
        
        return _response(200, response_data)
    
    except Exception as e:
        print(f"Error generating pre-signed URL: {str(e)}")
        return _response(500, {"error": str(e)})


# Test locally
if __name__ == "__main__":
    # Test Case 1: Valid request
    print("=== Test Case 1: Valid Request ===")
    test_event_1 = {
        "headers": {
            "authorization": "Bearer test_token",
            "tenant_id": "TNT_9080",
            "content-type": "application/json"
        },
        "body": json.dumps({
            "tenant_id": "TNT_9080",
            "agent_id": "AGT176148918296ca51",
            "sub_agent_id": "SUAGT1761489268526a52",
            "filename": "profile.jpg",
            "content_type": "image/jpeg",
            "method": "PUT"
        })
    }
    
    result_1 = lambda_handler(test_event_1, None)
    response_body_1 = json.loads(result_1['body'])
    print(f"Status: {result_1['statusCode']}")
    print(f"S3 Key: {response_body_1.get('s3_key')}")
    print(f"Upload URL: {response_body_1.get('upload_url', '')[:100]}...")
    
    # Test Case 2: Missing required fields
    print("\n=== Test Case 2: Missing sub_agent_id ===")
    test_event_2 = {
        "headers": {
            "authorization": "Bearer test_token",
            "tenant_id": "TNT_9080"
        },
        "body": json.dumps({
            "agent_id": "AGT176148918296ca51",
            "filename": "profile.jpg"
        })
    }
    
    result_2 = lambda_handler(test_event_2, None)
    response_body_2 = json.loads(result_2['body'])
    print(f"Status: {result_2['statusCode']}")
    print(f"Error: {response_body_2.get('error')}")
    
    # Test Case 3: Invalid file type
    print("\n=== Test Case 3: Invalid File Type ===")
    test_event_3 = {
        "headers": {
            "authorization": "Bearer test_token",
            "tenant_id": "TNT_9080"
        },
        "body": json.dumps({
            "agent_id": "AGT176148918296ca51",
            "sub_agent_id": "SUAGT1761489268526a52",
            "filename": "document.pdf",
            "content_type": "application/pdf"
        })
    }
    
    result_3 = lambda_handler(test_event_3, None)
    response_body_3 = json.loads(result_3['body'])
    print(f"Status: {result_3['statusCode']}")
    print(f"Error: {response_body_3.get('error')}")