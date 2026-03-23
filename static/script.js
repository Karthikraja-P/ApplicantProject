document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');
    const form = document.getElementById('application-form');

    function updateProgress() {
        const requiredFields = form.querySelectorAll('[required]');
        let filled = 0;
        requiredFields.forEach(field => {
            if (field.value.trim() !== '' && isValidField(field)) {
                filled++;
            }
        });
        const progress = requiredFields.length > 0 ? (filled / requiredFields.length) * 100 : 0;
        progressBar.style.setProperty('--progress', progress + '%');
        progressText.textContent = Math.round(progress) + '%';
    }

    function isValidField(field) {
        const value = field.value.trim();
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        } else if (field.type === 'tel') {
            // Since filtered, always valid
            return true;
        } else if (field.type === 'url') {
            try {
                new URL(value);
                return true;
            } catch {
                return value === '';
            }
        }
        return value !== '';
    }

    function showError(field, message) {
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        field.style.borderColor = '#ff4444';
    }

    function hideError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        field.style.borderColor = '#333';
    }

    function validateField(field) {
        const value = field.value.trim();
        hideError(field);

        if (field.hasAttribute('required') && value === '') {
            showError(field, 'This field is required.');
            return false;
        }

        if (value !== '') {
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    showError(field, 'Please enter a valid email address.');
                    return false;
                }
            } else if (field.type === 'tel') {
                // Since we filter input, phone should always be valid if not empty
                return true;
            } else if (field.type === 'url') {
                try {
                    new URL(value);
                } catch {
                    showError(field, 'Please enter a valid URL.');
                    return false;
                }
            }
        }

        return true;
    }

    // Update progress on input change
    form.addEventListener('input', function(e) {
        if (e.target.type === 'tel') {
            // Filter phone input to only allowed characters
            const allowedChars = /[^\+\d\s\-\(\)]/g;
            e.target.value = e.target.value.replace(allowedChars, '');
        }
        validateField(e.target);
        updateProgress();
    });
    form.addEventListener('change', function(e) {
        validateField(e.target);
        updateProgress();
    });

    // File validation
    const cvInput = document.getElementById('cv');
    cvInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showError(this, 'Please upload a PDF file only.');
            } else {
                hideError(this);
            }
        }
        updateProgress();
    });

    // Form validation before submission
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalid = null;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
                if (!firstInvalid) firstInvalid = field;
            }
        });

        // Also validate file
        if (cvInput.files.length === 0 || cvInput.files[0].type !== 'application/pdf') {
            showError(cvInput, 'CV upload is required (PDF only).');
            isValid = false;
            if (!firstInvalid) firstInvalid = cvInput;
        }

        if (!isValid) {
            e.preventDefault();
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
            alert('Please correct the errors and fill in all required fields.');
        }
    });

    // Initial progress update
    updateProgress();
});