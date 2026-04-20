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
*   `public/index.html`: Main application form (Personal, Professional, CV). Country/source "Other" text inputs added.
*   `public/iq_assessment.html`: Psychometric (IQ) test interface. Standardized btn-primary/btn-secondary buttons.
*   `public/skillset_assessment.html`: Technical skillset assessment. Standardized buttons.
*   `public/games.html`: Behavioral games assessment. Standardized buttons.
*   `public/admin_login.html`: Static admin login page — calls `/login` API, stores token in localStorage.
*   `public/admin.html`: Static admin dashboard — calls `/admin/applications?json=1`, renders applicant table. Filter bar now features a **Flatpickr-powered Date Range** selector.
*   `public/admin_detail.html`: Static applicant detail view — calls `/admin/application/{id}?json=1`. Logout is JS-based.
*   `public/static/styles.css`: Global brand aesthetic. Added `--gradient-next/prev` CSS vars, `.btn-primary`, `.btn-secondary`, `.sidebar .assessment-item.active` and mobile media queries (`@media max-width: 1024px/640px`).
*   `public/static/script.js`: Core form logic, step navigation, "Other" country & source field show/hide, updated review card for Other values.
*   `public/static/admin_logic.js`: Admin dashboard JS — fetches applications, renders table with Date Range filter (using **Flatpickr**). **Local CSV Export** and **Bulk CV Download** now respect active filters and work offline with dummy data.
*   `public/static/iq_assessment.js`: JS logic for rendering the 40-question IQ test.
*   `public/static/games.js`: BART and IGT game logic with submission flow.
*   `public/static/api_utils.js`: Helper functions for Cloud API interactions.

### 📂 `/lambda_src`
The server-side logic (Lambda Code).
*   `handler.py`: Unified entry point for all API routes. Routes: `POST /submit` (+ `other_country`, `other_source`), `POST /get-upload-url`, `POST /submit-final`, `POST /login`, `GET /admin/applications?json=1`, `GET /admin/application/{id}?json=1`, `GET /admin/export/csv` (Enhanced: full pagination + field mapping), `GET /admin/cv/{key}`.

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