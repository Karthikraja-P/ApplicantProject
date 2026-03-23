document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('application-form');
    const steps = Array.from(document.querySelectorAll('.wizard-card'));
    const totalSteps = steps.length;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const currentStepText = document.getElementById('current-step');
    const totalStepsText = document.getElementById('total-steps');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitContainer = document.querySelector('.submit-container');

    let currentStep = 1;

    function updateStep() {
        steps.forEach((stepCard, index) => {
            stepCard.classList.toggle('active', index === currentStep - 1);
        });

        const progress = Math.round((currentStep - 1) / totalSteps * 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        currentStepText.textContent = currentStep;
        totalStepsText.textContent = totalSteps;

        prevBtn.disabled = currentStep === 1;

        if (currentStep === totalSteps) {
            fillReviewCard();
            nextBtn.style.display = 'none';
            submitContainer.style.display = 'block';
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
        } else {
            nextBtn.style.display = 'inline-block';
            submitContainer.style.display = 'none';
        }
    }

    function cleanError(field) {
        const existing = field.parentNode.querySelector('.error-message');
        if (existing) existing.remove();
        field.style.borderColor = '#2f3f5f';
    }

    function showError(field, message) {
        cleanError(field);
        const err = document.createElement('div');
        err.className = 'error-message';
        err.textContent = message;
        field.parentNode.appendChild(err);
        field.style.borderColor = '#ff6f6f';
    }

    function validateField(field) {
        cleanError(field);
        const value = field.value.trim();

        if (field.hasAttribute('required') && !value) {
            showError(field, 'This field is required.');
            return false;
        }

        if (value) {
            if (field.type === 'email') {
                const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRe.test(value)) {
                    showError(field, 'Please enter a valid email address.');
                    return false;
                }
            }

            if (field.type === 'url') {
                try {
                    new URL(value);
                } catch {
                    showError(field, 'Please enter a valid URL.');
                    return false;
                }
            }

            if (field.type === 'tel' && value) {
                const clean = value.replace(/[\s\-\(\)]/g, '');
                if (!/^\+?\d{7,15}$/.test(clean)) {
                    showError(field, 'Please enter a valid phone number (7-15 digits).');
                    return false;
                }
            }

            if (field.id === 'cv') {
                const file = field.files[0];
                if (!file || file.type !== 'application/pdf') {
                    showError(field, 'Please upload a PDF file.');
                    return false;
                }
            }
        }

        return true;
    }

    function validateCurrentStep() {
        const activeCard = steps[currentStep - 1];
        const fields = activeCard.querySelectorAll('[required], #phone, #cv, #portfolio, #linkedin');
        let valid = true;

        fields.forEach(field => {
            if (field.type === 'checkbox') return;
            if (!validateField(field)) valid = false;
        });

        return valid;
    }

    function getSelectedValues(name) {
        return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value).join(', ') || 'None';
    }

    function fillReviewCard() {
        const review = document.getElementById('review-content');
        if (!review) return;

        const values = {
            'Full Name': document.getElementById('full_name').value.trim() || '—',
            'Email': document.getElementById('email').value.trim() || '—',
            'Phone': document.getElementById('phone').value.trim() || '—',
            'Location': document.getElementById('location').value.trim() || '—',
            'LinkedIn': document.getElementById('linkedin').value.trim() || '—',
            'Current Role': document.getElementById('current_role').value.trim() || '—',
            'Current Company': document.getElementById('current_company').value.trim() || '—',
            'Experience': document.getElementById('experience').value || '—',
            'Degree': document.getElementById('degree').value.trim() || '—',
            'Field of Study': document.getElementById('field').value.trim() || '—',
            'University': document.getElementById('university').value.trim() || '—',
            'Portfolio URL': document.getElementById('portfolio').value.trim() || '—',
            'Preferred Work Type': document.getElementById('work_type').value || '—',
            'Start Date': document.getElementById('start_date').value || '—',
            'Work Preference': document.getElementById('work_preference').value || '—',
            'Constraints': document.getElementById('constraints').value.trim() || '—',
            'Motivation': document.getElementById('interest').value.trim() || '—',
            'Problems Solving': document.getElementById('problems').value.trim() || '—',
            'Primary Area': document.getElementById('area').value || '—',
            'Skills': getSelectedValues('skills'),
            'Source': document.getElementById('source').value || '—'
        };

        review.innerHTML = Object.entries(values).map(([label, value]) => `                <li><strong>${label}:</strong> ${value}</li>`).join('');
    }

    function sanitizePhone(e) {
        if (e.target.type !== 'tel') return;
        e.target.value = e.target.value.replace(/[^\d+\s\-\(\)]/g, '');
    }

    form.addEventListener('input', sanitizePhone);
    form.addEventListener('input', function(e) {
        if (['email', 'url', 'tel', 'text', 'date', 'select-one', 'textarea'].includes(e.target.type)) {
            validateField(e.target);
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    nextBtn.addEventListener('click', function() {
        if (!validateCurrentStep()) return;
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });

    form.addEventListener('submit', function(e) {
        if (!validateCurrentStep()) {
            e.preventDefault();
            return;
        }

        const required = form.querySelectorAll('[required]');
        for (const field of required) {
            if (!validateField(field)) {
                e.preventDefault();
                return;
            }
        }

        const cvField = document.getElementById('cv');
        if (!cvField.files[0] || cvField.files[0].type !== 'application/pdf') {
            showError(cvField, 'Please upload a PDF file.');
            e.preventDefault();
            return;
        }

        // no further action; proceed to backend submit
    });

    totalStepsText.textContent = totalSteps;
    updateStep();
});
