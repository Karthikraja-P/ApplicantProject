# Implementation Plan - Serverless Migration to AWS

This plan outlines the steps to migrate the `ApplicantProject` (currently a Flask app) to a fully serverless architecture on AWS.

## Proposed Changes

### Frontend Migration
The frontend will be decoupled from Flask and hosted as a static site.

#### [MODIFY] [index.html](file:///Users/apple/Desktop/ApplicantProject/frontend/templates/index.html) (Move to static)
- Move all files from `frontend/templates/` to a new `dist/` or `public/` directory (e.g., `frontend/public/`).
- Replace Jinja2 syntax like `{{ url_for('submit') }}` with static paths.
- Update form handling to use JavaScript `fetch` calls to the API Gateway endpoint.
- Adapt `iq_assessment.js` and `games.js` to save results via the same API.

---

### Backend Migration
The Flask backend will be replaced by AWS Lambda + API Gateway.

#### [NEW] [handler.py](file:///Users/apple/Desktop/ApplicantProject/backend/handler.py)
- Implement a Lambda handler to process incoming requests.
- Routes to handle: 
    - `POST /submit`: Final application submission (S3 for CV, DynamoDB for data).
    - `POST /save`: Save draft (DynamoDB).
    - `GET /load-draft`: Load draft (DynamoDB).
    - `POST /assessment/results`: Save IQ and Game scores (DynamoDB).

#### [MODIFY] [DynamoDB Integration]
- Replace `saved_applications/` local storage with a DynamoDB table `ApplicantApplications`.
- Primary Key: `email` (String).
- Sort Key: `timestamp` or `type` (draft vs final).

#### [MODIFY] [S3 Integration]
- Use S3 for CV uploads. The frontend will request a **Pre-signed URL** from Lambda to upload directly to S3, avoiding Lambda payload limits.

---

### Infrastructure (AWS Resources)
- **S3 (Frontend)**: Static website hosting for all HTML/JS/CSS files.
- **S3 (Assets)**: Storage for uploaded CVs.
- **CloudFront**: CDN for the frontend.
- **API Gateway**: REST API for Lambda.
- **Lambda**: Compute for backend logic.
- **DynamoDB**: Table for application and assessment data.

## Verification Plan

### Automated Tests
- I will provide a script `verify_aws_config.py` to check if AWS resources are accessible (if credentials provided).
- Unit tests for the new Lambda handlers using `pytest` and `moto` (mocking AWS).

### Manual Verification
1. **Frontend Check**: Open the static `index.html` in a browser and verify it loads styles/JS.
2. **Form Submission**: Fill out the form and submit.
3. **S3/DynamoDB Verification**: Check (via CLI or Console) if the record appeared in DynamoDB and the file in S3.
