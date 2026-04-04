from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import os
import json
from datetime import datetime

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')
app.secret_key = 'your_secret_key_here'  # Change this to a random secret key

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/save', methods=['POST'])
def save_progress():
    # Save form data to session
    data = {
        'full_name': request.form.get('full_name'),
        'email': request.form.get('email'),
        'country_code': request.form.get('country_code'),
        'phone': request.form.get('phone'),
        'location_country': request.form.get('location_country'),
        'location': request.form.get('location'),
        'linkedin': request.form.get('linkedin'),
        'current_role': request.form.get('current_role'),
        'current_company': request.form.get('current_company'),
        'experience': request.form.get('experience'),
        'degree': request.form.get('degree'),
        'field': request.form.get('field'),
        'university': request.form.get('university'),
        'portfolio': request.form.get('portfolio'),
        'github': request.form.get('github'),
        'website': request.form.get('website'),
        'work_type': request.form.get('work_type'),
        'start_date': request.form.get('start_date'),
        'work_preference': request.form.get('work_preference'),
        'constraints': request.form.get('constraints'),
        'interest': request.form.get('interest'),
        'problems': request.form.get('problems'),
        'area': request.form.get('area'),
        'skills': request.form.getlist('skills'),
        'source': request.form.get('source')
    }
    session['form_data'] = data
    
    # Also save to a file for persistence
    if not os.path.exists('saved_applications'):
        os.makedirs('saved_applications')
    
    # Create filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    email = data.get('email', 'unknown').replace('@', '_at_')
    filename = f"saved_applications/draft_{email}_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({'status': 'success', 'message': 'Progress saved successfully'})

@app.route('/load-draft', methods=['GET'])
def load_draft():
    """Load the most recent draft from saved applications"""
    if not os.path.exists('saved_applications'):
        return jsonify({'status': 'error', 'message': 'No saved drafts found'}), 404
    
    # Get all draft files
    drafts = [f for f in os.listdir('saved_applications') if f.startswith('draft_')]
    if not drafts:
        return jsonify({'status': 'error', 'message': 'No saved drafts found'}), 404
    
    # Sort by modification time and get the most recent
    drafts.sort(key=lambda f: os.path.getmtime(os.path.join('saved_applications', f)), reverse=True)
    latest_draft = drafts[0]
    
    try:
        with open(os.path.join('saved_applications', latest_draft), 'r') as f:
            data = json.load(f)
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    # Process form data
    data = {
        'full_name': request.form.get('full_name'),
        'email': request.form.get('email'),
        'country_code': request.form.get('country_code'),
        'phone': request.form.get('phone'),
        'location': request.form.get('location'),
        'linkedin': request.form.get('linkedin'),
        'current_role': request.form.get('current_role'),
        'current_company': request.form.get('current_company'),
        'experience': request.form.get('experience'),
        'degree': request.form.get('degree'),
        'field': request.form.get('field'),
        'university': request.form.get('university'),
        'portfolio': request.form.get('portfolio'),
        'github': request.form.get('github'),
        'website': request.form.get('website'),
        'work_type': request.form.get('work_type'),
        'start_date': request.form.get('start_date'),
        'work_preference': request.form.get('work_preference'),
        'constraints': request.form.get('constraints'),
        'interest': request.form.get('interest'),
        'problems': request.form.get('problems'),
        'area': request.form.get('area'),
        'skills': request.form.getlist('skills'),
        'source': request.form.get('source')
    }

    # Handle CV upload
    if 'cv' in request.files:
        cv_file = request.files['cv']
        if cv_file.filename != '':
            filename = f"{data['full_name'].replace(' ', '_')}_CV.pdf"
            cv_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            data['cv_filename'] = filename

    # Here you could save to database or file
    # For now, just print to console
    print("Application received:", data)

    # Redirect based on primary area of interest
    area = data.get('area')
    if area == 'database':
        return redirect(url_for('next_database'))
    elif area == 'ml':
        return redirect(url_for('next_ml'))
    elif area == 'ai':
        return redirect(url_for('next_ai'))
    else:  # not-sure or others
        return redirect(url_for('next_not_sure'))

@app.route('/next/database')
def next_database():
    return render_template('next_database.html')

@app.route('/next/ml')
def next_ml():
    return render_template('next_ml.html')

@app.route('/next/ai')
def next_ai():
    return render_template('next_ai.html')

@app.route('/next/not-sure')
def next_not_sure():
    return render_template('next_not_sure.html')


@app.route('/games')
def games():
    return render_template('games.html')


@app.route('/assessment')
def assessment():
    return render_template('assessment.html')

@app.route('/assessment/iq')
def assessment_iq():
    return render_template('iq_assessment.html')

@app.route('/assessment/skillset')
def assessment_skillset():
    return render_template('skillset_assessment.html')


@app.route('/assessment/skill')
def assessment_skill():
    return render_template('skill_selection.html')

@app.route('/assessment/skill/ml')
def assessment_skill_ml():
    return render_template('skill_test.html', test_type='ml')

@app.route('/assessment/skill/db')
def assessment_skill_db():
    return render_template('skill_test.html', test_type='db')


if __name__ == '__main__':
    app.run(debug=True)
