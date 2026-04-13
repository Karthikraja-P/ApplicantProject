# Singularity Applicant Portal - Architecture & Map 🏹🗺️

This portal is a serverless application designed for high-signal recruitment. It features a multi-step application form and three distinct assessments (Psychometric, Technical, and Games).

## 🏙️ Architecture Overview
The application follows a **Static Site + Serverless Backend** architecture:
1.  **Frontend**: Hosted on **AWS S3** and delivered via **CloudFront**. It uses vanilla JS/HTML/CSS for speed and precision.
2.  **Backend**: **AWS Lambda** (Python) handled via API Gateway.
3.  **Database**: **DynamoDB** for storing applicant metadata and assessment scores.
4.  **Security**: Admin routes are protected via basic auth and restricted to JSON-based communication.

## 🗺️ Codebase Map (Index)

### 📂 `/frontend`
The core user-facing application (S3 Content).
*   `public/index.html`: Main application form (Personal, Professional, CV).
*   `public/iq_assessment.html`: Psychometric (IQ) test interface.
*   `public/skillset_assessment.html`: Technical skillset assessment.
*   `public/games.html`: Behavioral games assessment.
*   `public/static/styles.css`: Global Singularity brand aesthetic (Starfield, Shooting stars).
*   `public/static/script.js`: Core form logic and step navigation.
*   `public/static/iq_assessment.js`: JS logic for rendering the 40-question IQ test.
*   `public/static/api_utils.js`: Helper functions for Cloud API interactions.

### 📂 `/lambda_src`
The server-side logic (Lambda Code).
*   `handler.py`: Unified entry point for all API routes (Submission, Admin Dashboard, CSV Export, CV viewing).

### 📂 `/scripts`
Maintenance and testing tools.
*   `add_dummy_applicant.py`: Simulates a full application submission for testing.
*   `cleanup_iq_assets.py`: Utilities for maintaining IQ question images.
*   `update_cf_config.py`: Automates CloudFront distribution updates.

### 📜 Root Files
*   `README.md`: This map. 🏹📍
*   `cf_config.json`: Infrastructure blueprint for CloudFront.
*   `Singularity.mhtml`: Visual reference for brand consistency.

## 🛠️ Testing Workflow
Before finalizing any change, follow this sequence:
1.  **Local Style Check**: Open the relevant `.html` file locally to verify transparency and starfield visibility.
2.  **Deployment**: Run `aws s3 sync` and CloudFront invalidation.
3.  **End-to-End**: Submit a test application using the portal and verify data appears in the Admin dashboard.
4.  **Admin Check**: Verify CSV export works and PDF CV links are functional.