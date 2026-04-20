# Bug Fixes — TalentForge / Singularity

## Context
Serverless architecture: AWS Lambda (Python 3.12) + DynamoDB + S3 + CloudFront. Frontend is static HTML/JS served via CloudFront. All admin auth is cookie-based (`admin_session`).

---

## Security Fixes

### 1. Admin password exposed in CSV export
**File:** `lambda_src/handler.py`  
CV download links in the exported CSV previously embedded the plaintext admin password as a `?pass=` query parameter, making it visible to anyone who received the file. Fixed by generating clean `/admin/cv/{key}` URLs — the browser session cookie handles auth when the admin clicks the link.

### 2. Admin password stored in `localStorage`
**File:** `frontend/public/admin_login.html`, `frontend/public/static/admin_logic.js`  
After login, the raw password was saved to `localStorage` and sent as an `X-Admin-Pass` header on every admin API request. Removed the `localStorage.setItem('tf_admin_pass', ...)` call and replaced all `X-Admin-Pass` header usage with `credentials: 'include'` so the session cookie is sent automatically by the browser.

### 3. Stored XSS in admin HTML views
**File:** `lambda_src/handler.py`  
User-supplied fields (`full_name`, `email`, `area`, `experience`, `location_country`, and all detail-page fields) were interpolated directly into HTML table cells with no escaping. Added an `html_esc()` helper (wrapping `html.escape()`) and applied it to all user values rendered into the admin list and detail HTML responses.

### 4. `javascript:` URL injection via applicant-supplied links
**File:** `frontend/public/static/admin_logic.js`  
LinkedIn, GitHub, portfolio, and website URLs were inserted into `href` attributes without validation, allowing `javascript:alert(...)` payloads to execute when an admin clicked a link. Added a `safeUrl()` helper that only passes through `http://` and `https://` URLs, with all others silently omitted. Also added `rel="noopener noreferrer"` to all external link targets.

### 5. Auth cookie missing `Secure` flag
**File:** `lambda_src/handler.py`  
The `admin_session` cookie lacked the `Secure` attribute, meaning it could be transmitted over plain HTTP. Added `Secure` — safe in this deployment since CloudFront enforces HTTPS.

---

## Logic / Game Flow Fixes

### 6. BART game state reset on resume (broken resume)
**File:** `frontend/public/static/games.js`  
`startBART(isResume)` had an `if (!isResume)` guard for state initialisation, but then unconditionally reset all BART state again outside the guard (lines 197–198). Removed the duplicate reset so resuming after a page refresh correctly preserves accumulated balloon data.

### 7. IGT game always reinitialised on resume
**File:** `frontend/public/static/games.js`  
`startIGT()` took no parameters and always reset trial/balance/deck state, making the `startIGT(true)` resume call non-functional. Added an `isResume` parameter and wrapped the state initialisation in `if (!isResume)`. Also added the missing `localStorage` markers (`current_assessment_active`, `tf_game_step`) to mirror the BART flow.

---

## API / Integration Fixes

### 8. Dead `fetch` call to non-existent route
**File:** `frontend/public/static/assessment.js`  
`showResults()` was posting timing data to `/assessment/submit`, a route that does not exist in the Lambda handler (would 404). The error was silently swallowed. Removed the call entirely since timing data had no backend consumer.

### 9. Broken navigation links in IQ assessment completed banner
**File:** `frontend/public/static/iq_assessment.js`  
The "already completed" banner linked to `/assessment/skillset` and `/confirmation` — neither of which are valid CloudFront paths. Changed to `/skillset_assessment.html` and `/confirmation.html`.

---

## State Management Fix

### 10. "New Candidate" reset left assessment stage intact
**File:** `frontend/public/static/script.js`  
The New Candidate button cleared form and score data but did not clear `tf_assessment_stage`, `submissionTime`, or the games tracking keys (`current_assessment_active`, `tf_game_step`, `tf_game_start_time`). A subsequent candidate on the same device would be immediately redirected to the assessment flow, bypassing the application form. Added all missing keys to the removal list.
