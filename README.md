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

- **IQ Assessment Integration**:
  - Implemented a native 46-question IQ assessment (replacing the iframe).
  - Added "Fitted Together" perceptual reasoning question.
  - Added "Bloops, Razzies, and Lazzies" syllogism as Question 11.
  - Added "Comb and Needle" series completion as Question 19.
  - Total assessment count is now 46.
- Question 27 has been updated with a custom SVG layout to match the intended logic for 16 four-sided figures.
- Question 32 (Arrow Sequence) has been refined for visual parity with stacked horizontal arrows.
- Question 35 (Stars and Moons Pattern) has been updated with precise (row, col) coordinates to reach 100% visual parity with the reference screenshot.
- Custom rendering logic in `iq_assessment.js` supports `customHtml` and `customOptsHtml` for complex diagrams.