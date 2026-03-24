from flask import Flask, render_template, request, redirect, url_for, flash
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this to a random secret key

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('form.html')

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

if __name__ == '__main__':
    app.run(debug=True)
