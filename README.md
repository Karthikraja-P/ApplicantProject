# TalentForge

A web application for collecting candidate information for TalentForge.

## Setup

1. Install Python 3.8 or higher from https://python.org
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `python main.py`

The application will start on http://localhost:5000

## Features

- Multi-step form with progress indicator
- File upload for CV (PDF only)
- Dark theme matching Quant Singularity website
- Mobile-friendly design
- Form validation

## IQ Assessment

- General IQ questions are defined in `frontend/static/iq_assessment.js`.
- The current question slice includes the first 35 questions (`QUESTIONS = QUESTIONS.slice(0, 35);`).
- New questions (21‑35) need to be added after the existing 20th entry in the `QUESTIONS` array.
- Once the question objects are available (title, source, customHtml/customOptsHtml or image URLs, answer index, explanation), they can be inserted directly into the array.
- After adding the questions, update the UI count in `frontend/templates/iq_assessment.html` if needed.

*TODO*: Add question objects for entries 21‑35 once the source files (screenshots or data) are provided.