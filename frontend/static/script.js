    // Specialized section Previous buttons
    const prevBtnSpecialDB = document.getElementById('prev-btn-special-db');
    const prevBtnSpecialML = document.getElementById('prev-btn-special-ml');
    const prevBtnSpecialAI = document.getElementById('prev-btn-special-ai');
    function goToPrevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    }
    if (prevBtnSpecialDB) prevBtnSpecialDB.addEventListener('click', goToPrevStep);
    if (prevBtnSpecialML) prevBtnSpecialML.addEventListener('click', goToPrevStep);
    if (prevBtnSpecialAI) prevBtnSpecialAI.addEventListener('click', goToPrevStep);
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('application-form');
    const steps = Array.from(document.querySelectorAll('.wizard-card'));
    const totalSteps = steps.length;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const currentStepText = document.getElementById('current-step');
    const totalStepsText = document.getElementById('total-steps');
    const nextBtn = document.getElementById('next-btn');
    const saveBtn = document.getElementById('save-btn');
    const submitContainer = document.querySelector('.submit-container');
    const stepItems = document.querySelectorAll('.step-item');

    // Phone number digit length mapping per country
    const countryPhoneDigits = {
        '+1': { digits: 10, name: 'US' },
        '+44': { digits: 10, name: 'UK' },
        '+91': { digits: 10, name: 'India' },
        '+61': { digits: 9, name: 'Australia' },
        '+81': { digits: 10, name: 'Japan' },
        '+49': { digits: 10, name: 'Germany' },
        '+33': { digits: 9, name: 'France' },
        '+86': { digits: 11, name: 'China' },
        '+7': { digits: 10, name: 'Russia' },
        '+55': { digits: 11, name: 'Brazil' }
    };

    // City suggestions per country
    const countryCities = {
        'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Boston'],
        'UK': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol'],
        'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
        'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
        'Japan': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka'],
        'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart'],
        'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'],
        'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou'],
        'Russia': ['Moscow', 'St. Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod'],
        'Brazil': ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza', 'Belo Horizonte'],
        'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
        'Singapore': ['Singapore'],
        'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
        'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancun', 'Playa del Carmen'],
        'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
        'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lucerne'],
        'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'],
        'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Venice', 'Florence'],
        'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Bilbao', 'Seville'],
        'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon']
    };

    const countryCodeSelect = document.getElementById('country_code');
    const phoneInput = document.getElementById('phone');
    const locationCountrySelect = document.getElementById('location_country');
    const locationInput = document.getElementById('location');
    const cityLocations = document.getElementById('city-locations');

    // Specialized skill sections
    const areaSelect = document.getElementById('area');
    const sectionDB = document.getElementById('specialized-section-database');
    const sectionML = document.getElementById('specialized-section-ml');
    const sectionAI = document.getElementById('specialized-section-ai');

    function updateSpecializedSection() {
        if (!areaSelect) return;
        const val = areaSelect.value;
        if (sectionDB) sectionDB.style.display = (val === 'database') ? 'block' : 'none';
        if (sectionML) sectionML.style.display = (val === 'ml') ? 'block' : 'none';
        if (sectionAI) sectionAI.style.display = (val === 'ai') ? 'block' : 'none';
    }
    if (areaSelect) {
        areaSelect.addEventListener('change', updateSpecializedSection);
        // Show correct section on load (in case of cache)
        setTimeout(updateSpecializedSection, 200);
    }

    // Update phone input maxlength and placeholder based on country code
    function updatePhoneFormat() {
        const countryCode = countryCodeSelect.value;
        const phoneInfo = countryPhoneDigits[countryCode];
        if (phoneInfo) {
            phoneInput.maxLength = phoneInfo.digits;
            phoneInput.placeholder = '0'.repeat(phoneInfo.digits);
            phoneInput.setAttribute('data-digits', phoneInfo.digits);
        }
    }

    // Update city suggestions based on selected country
    function updateCitySuggestions() {
        const country = locationCountrySelect.value;
        cityLocations.innerHTML = '';
        
        if (country && countryCities[country]) {
            countryCities[country].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                cityLocations.appendChild(option);
            });
        }
    }

    // Event listeners
    countryCodeSelect.addEventListener('change', updatePhoneFormat);
    locationCountrySelect.addEventListener('change', updateCitySuggestions);

    // Initialize phone format on load
    updatePhoneFormat();

    let currentStep = 1;

    function updateStep() {
        steps.forEach((stepCard, index) => {
            stepCard.classList.toggle('active', index === currentStep - 1);
        });

        stepItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentStep - 1);
        });

        const progress = Math.round((currentStep - 1) / totalSteps * 100);
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        currentStepText.textContent = currentStep;
        totalStepsText.textContent = totalSteps;

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
        
            // Show/hide Previous button
        if (prevBtn) {
            if (currentStep > 1) {
                prevBtn.style.display = 'inline-block';
            } else {
                prevBtn.style.display = 'none';
            }
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
                const maxDigits = parseInt(field.getAttribute('data-digits')) || 10;
                const clean = value.replace(/[^\d]/g, '');
                if (!/^\d{5,}$/.test(clean)) {
                    showError(field, `Please enter a valid phone number with at least 5 digits.`);
                    return false;
                }
                if (clean.length > maxDigits + 2) {
                    showError(field, `Phone number exceeds maximum digits for this country.`);
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
        const fields = activeCard.querySelectorAll('[required]');
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

        const countryCode = document.getElementById('country_code').value || '';
        const phone = document.getElementById('phone').value.trim() || '';
        const fullPhone = phone ? `${countryCode} ${phone}` : '—';

        const values = {
            'Full Name': document.getElementById('full_name').value.trim() || '—',
            'Email': document.getElementById('email').value.trim() || '—',
            'Phone': fullPhone,
            'Country': document.getElementById('location_country').value || '—',
            'City': document.getElementById('location').value.trim() || '—',
            'LinkedIn': document.getElementById('linkedin').value.trim() || '—',
            'Current Role': document.getElementById('current_role').value.trim() || '—',
            'Current Company': document.getElementById('current_company').value.trim() || '—',
            'Experience': document.getElementById('experience').value || '—',
            'Degree': document.getElementById('degree').value.trim() || '—',
            'Field of Study': document.getElementById('field').value.trim() || '—',
            'University': document.getElementById('university').value.trim() || '—',
            'Portfolio URL': document.getElementById('portfolio').value.trim() || '—',
            'GitHub URL': document.getElementById('github').value.trim() || '—',
            'Website/Blog': document.getElementById('website').value.trim() || '—',
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
        // Remove non-digit characters but keep +
        let value = e.target.value.replace(/[^\d]/g, '');
        const maxDigits = parseInt(e.target.getAttribute('data-digits')) || 10;
        // Limit to max digits
        e.target.value = value.substring(0, maxDigits);
    }

    form.addEventListener('input', sanitizePhone);

    saveBtn.addEventListener('click', function() {
        const formData = new FormData(form);

        // Capture for local cache - convert FormData to object
        const cacheData = {};
        formData.forEach((value, key) => {
            if (key === 'cv') return; // Skip file uploads

            if (cacheData[key]) {
                // Handle multiple values (checkboxes)
                if (!Array.isArray(cacheData[key])) {
                    cacheData[key] = [cacheData[key]];
                }
                cacheData[key].push(value);
            } else {
                cacheData[key] = value;
            }
        });

        // Save to localStorage
        localStorage.setItem('formCache', JSON.stringify(cacheData));
        localStorage.setItem('formCacheTimestamp', new Date().toISOString());
        console.log('💾 Cached to localStorage:', Object.keys(cacheData).length, 'fields');

        // Show success message
        const message = document.createElement('div');
        message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #00d4ff, #00ff88); color: #000; padding: 12px 20px; border-radius: 8px; font-weight: bold; z-index: 9999; animation: slideIn 0.3s ease;';
        message.textContent = '✓ Progress saved successfully!';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    });

    nextBtn.addEventListener('click', function() {
        // Allow navigation without validation - removed validation check
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });

    // Previous button navigation
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    }

    stepItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const step = parseInt(item.dataset.step);
            if (step <= currentStep || validateCurrentStep()) {
                currentStep = step;
                updateStep();
            }
        });
    });


    // --- Enable/disable submit button on review step ---
    const submitBtn = document.querySelector('.submit-btn');
    function checkReviewValidity() {
        if (!submitBtn) return;
        // Only check on review step
        if (currentStep !== totalSteps) return;
        let valid = true;
        const reviewCard = steps[totalSteps - 1];
        // Check all required fields in the form (not just review step)
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (field.type === 'checkbox') return;
            if (!field.value || (field.type === 'file' && !field.files[0])) valid = false;
        });
        // Special check for CV file type
        const cvField = document.getElementById('cv');
        if (cvField && (!cvField.files[0] || cvField.files[0].type !== 'application/pdf')) valid = false;
        submitBtn.disabled = !valid;
    }

    // Check validity on step change and on input
    form.addEventListener('input', checkReviewValidity);
    form.addEventListener('change', checkReviewValidity);
    // Also check when step changes
    const origUpdateStep = updateStep;
    updateStep = function() {
        origUpdateStep();
        checkReviewValidity();
    };

    // Static submission: validate then redirect to the appropriate confirmation page
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (submitBtn && submitBtn.disabled) return;

        const required = form.querySelectorAll('[required]');
        for (const field of required) {
            if (!validateField(field)) return;
        }
        const cvField = document.getElementById('cv');
        if (!cvField.files[0] || cvField.files[0].type !== 'application/pdf') {
            showError(cvField, 'Please upload a PDF file.');
            return;
        }

        // Clear saved draft on successful submission
        localStorage.removeItem('formCache');
        localStorage.removeItem('formCacheTimestamp');

        const area = document.getElementById('area').value;
        localStorage.setItem('selectedArea', area);
        switchTab('psych');
    });

    // Local storage cache functions
    function saveFormToCache() {
        // Use FormData like the Save button does for consistency
        const formData = new FormData(form);
        const cache = {};
        
        formData.forEach((value, key) => {
            if (key === 'cv') return; // Skip file uploads
            
            if (cache[key]) {
                if (!Array.isArray(cache[key])) {
                    cache[key] = [cache[key]];
                }
                cache[key].push(value);
            } else {
                cache[key] = value;
            }
        });
        
        localStorage.setItem('formCache', JSON.stringify(cache));
        localStorage.setItem('formCacheTimestamp', new Date().toISOString());
        console.log('✓ Form auto-cached:', Object.keys(cache).length, 'fields');
    }
    
    function loadFormFromCache() {
        const cached = localStorage.getItem('formCache');
        if (!cached) {
            console.log('ℹ No cache found in localStorage');
            return false;
        }
        
        try {
            const cache = JSON.parse(cached);
            console.log('✓ Loading from localStorage cache:', Object.keys(cache).length, 'fields');
            
            let fieldsRestored = 0;
            // Restore all form fields
            Object.entries(cache).forEach(([key, value]) => {
                try {
                    if (Array.isArray(value)) {
                        // Handle multiple values (checkboxes)
                        value.forEach(val => {
                            const field = form.querySelector(`input[name="${key}"][value="${val}"]`);
                            if (field && (field.type === 'checkbox' || field.type === 'radio')) {
                                field.checked = true;
                                fieldsRestored++;
                            }
                        });
                    } else if (value && typeof value === 'string') {
                        const field = form.querySelector(`[name="${key}"]`);
                        if (field && field.type !== 'file') {
                            field.value = value;
                            fieldsRestored++;
                            console.log(`  ✓ ${key}: "${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"`);
                        }
                    }
                } catch (e) {
                    console.log(`  ⚠ Failed to restore ${key}:`, e.message);
                }
            });
            
            // Trigger change events to update dependent fields
            try {
                locationCountrySelect.dispatchEvent(new Event('change'));
                countryCodeSelect.dispatchEvent(new Event('change'));
            } catch (e) {
                console.log('  ⚠ Some dropdowns issue:', e.message);
            }
            
            console.log(`✓ Successfully restored ${fieldsRestored} fields from cache`);
            return true;
        } catch (error) {
            console.error('✗ Error loading form cache:', error);
            return false;
        }
    }
    
    function loadFormFromBackend() {
        // Static hosting: no backend available
        return Promise.resolve(false);
    }
    
    // Auto-save form on any input change (but prevent during initial load)
    let isLoading = true;
    
    // Debounce auto-save to avoid too frequent saves
    let autoSaveTimeout;
    function autoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            if (!isLoading) {
                saveFormToCache();
            }
        }, 500);
    }
    
    form.addEventListener('input', autoSave);
    form.addEventListener('change', autoSave);

    totalStepsText.textContent = totalSteps;
    updateStep();
    
    // Load cached data on page load with small delay to ensure DOM is ready
    console.log('🔄 Starting form data restoration...');
    setTimeout(() => {
        (async function() {
            console.log('📋 Form fields available:', form.querySelectorAll('[name]').length);
            const loadedFromCache = loadFormFromCache();
            if (!loadedFromCache) {
                console.log('ℹ Cache empty, trying backend...');
                await loadFormFromBackend();
            }
            isLoading = false;
            console.log('✓ Form restoration complete - auto-save now active');
        })();
    }, 100);
});
