import json
import unittest
from unittest.mock import patch, MagicMock
from backend.handler import handler

class TestHandler(unittest.TestCase):

    def setUp(self):
        self.mock_s3 = patch('backend.handler.s3_client').start()
        self.mock_table = patch('backend.handler.table').start()

    def tearDown(self):
        patch.stopall()

    def test_upload_url_success(self):
        self.mock_s3.generate_presigned_url.return_value = "https://mock-s3-url.com"
        
        event = {
            'resource': '/upload-url',
            'httpMethod': 'POST',
            'body': json.dumps({
                'filename': 'test.pdf',
                'email': 'test@example.com'
            })
        }
        
        res = handler(event, None)
        body = json.loads(res['body'])
        
        self.assertEqual(res['statusCode'], 200)
        self.assertEqual(body['upload_url'], "https://mock-s3-url.com")
        self.assertIn("uploads/test_at_example.com/", body['file_key'])

    def test_save_draft_success(self):
        event = {
            'resource': '/save',
            'httpMethod': 'POST',
            'body': json.dumps({
                'email': 'test@example.com',
                'draft': {'full_name': 'Test User'}
            })
        }
        
        res = handler(event, None)
        body = json.loads(res['body'])
        
        self.assertEqual(res['statusCode'], 200)
        self.assertEqual(body['status'], 'success')
        self.mock_table.put_item.assert_called_once()

    def test_submit_success(self):
        self.mock_table.get_item.return_value = {} # No existing final
        
        event = {
            'resource': '/submit',
            'httpMethod': 'POST',
            'body': json.dumps({
                'email': 'test@example.com',
                'full_name': 'Test User',
                'cv_key': 'uploads/test.pdf'
            })
        }
        
        res = handler(event, None)
        body = json.loads(res['body'])
        
        self.assertEqual(res['statusCode'], 200)
        self.assertEqual(body['status'], 'success')
        self.mock_table.put_item.assert_called()
        self.mock_table.delete_item.assert_called_with(Key={'email': 'test@example.com', 'submission_id': 'draft'})

    def test_submit_duplicate(self):
        self.mock_table.get_item.return_value = {'Item': {'email': 'test@example.com', 'submission_id': 'final'}}
        
        event = {
            'resource': '/submit',
            'httpMethod': 'POST',
            'body': json.dumps({
                'email': 'test@example.com'
            })
        }
        
        res = handler(event, None)
        body = json.loads(res['body'])
        
        self.assertEqual(res['statusCode'], 400)
        self.assertEqual(body['error'], 'already_applied')

if __name__ == '__main__':
    unittest.main()
