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
- The assessment now includes 45 questions (`QUESTIONS = QUESTIONS.slice(0, 45);`).
- Question 27 has been updated with a custom SVG layout to match the intended logic for 16 four-sided figures.
- Custom rendering logic in `iq_assessment.js` supports `customHtml` and `customOptsHtml` for complex diagrams.