document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('application-form');
    const steps = Array.from(document.querySelectorAll('.wizard-card'));
    const totalSteps = steps.length;
    const progressBar = document.getElementById('progress-bar');
    const currentStepText = document.getElementById('current-step');
    const totalStepsText = document.getElementById('total-steps');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const saveBtn = document.getElementById('save-btn');
    const submitContainer = document.querySelector('.submit-container');
    const submitBtn = document.querySelector('.submit-btn');
    // Only numbered sidebar steps (not assessment <a> links)
    const stepItems = document.querySelectorAll('.step-item[data-step]');

    // Required fields map: field id → step number
    const REQUIRED_FIELDS = {
        full_name: 1, email: 1, location_country: 1, location: 1, linkedin: 1,
        current_role: 2, current_company: 2, experience: 2, degree: 2, field: 2, university: 2,
        work_type: 4, start_date: 4, work_preference: 4,
        interest: 5,
        area: 6, source: 6
    };

    const countryPhoneDigits = {
        '+1': { digits: 10 }, '+44': { digits: 10 }, '+91': { digits: 10 },
        '+61': { digits: 9 }, '+81': { digits: 10 }, '+49': { digits: 10 },
        '+33': { digits: 9 }, '+86': { digits: 11 }, '+7': { digits: 10 }, '+55': { digits: 11 }
    };

    const countryCities = {
        'USA': ['New York','Los Angeles','Chicago','Houston','Phoenix','San Francisco','Seattle','Boston'],
        'UK': ['London','Manchester','Birmingham','Leeds','Glasgow','Liverpool','Bristol'],
        'India': ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad'],
        'Australia': ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast'],
        'Japan': ['Tokyo','Osaka','Yokohama','Nagoya','Sapporo','Fukuoka'],
        'Germany': ['Berlin','Munich','Frankfurt','Hamburg','Cologne','Stuttgart'],
        'France': ['Paris','Lyon','Marseille','Toulouse','Nice','Nantes'],
        'China': ['Beijing','Shanghai','Guangzhou','Shenzhen','Chengdu','Hangzhou'],
        'Russia': ['Moscow','St. Petersburg','Novosibirsk','Yekaterinburg','Nizhny Novgorod'],
        'Brazil': ['São Paulo','Rio de Janeiro','Salvador','Fortaleza','Belo Horizonte'],
        'Canada': ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton'],
        'Singapore': ['Singapore'],
        'UAE': ['Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah'],
        'Mexico': ['Mexico City','Guadalajara','Monterrey','Cancun','Playa del Carmen'],
        'Netherlands': ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven'],
        'Switzerland': ['Zurich','Geneva','Basel','Bern','Lucerne'],
        'Sweden': ['Stockholm','Gothenburg','Malmö','Uppsala','Västerås'],
        'Italy': ['Rome','Milan','Naples','Turin','Venice','Florence'],
        'Spain': ['Madrid','Barcelona','Valencia','Bilbao','Seville'],
        'South Korea': ['Seoul','Busan','Incheon','Daegu','Daejeon']
    };

    const countryCodeSelect = document.getElementById('country_code');
    const phoneInput = document.getElementById('phone');
    const locationCountrySelect = document.getElementById('location_country');
    const cityLocations = document.getElementById('city-locations');
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
        setTimeout(updateSpecializedSection, 200);
    }

    function updatePhoneFormat() {
        const code = countryCodeSelect.value;
        const info = countryPhoneDigits[code];
        if (info) {
            phoneInput.maxLength = info.digits;
            phoneInput.placeholder = '0'.repeat(info.digits);
            phoneInput.setAttribute('data-digits', info.digits);
        }
    }

    function updateCitySuggestions() {
        const country = locationCountrySelect.value;
        cityLocations.innerHTML = '';
        if (country && countryCities[country]) {
            countryCities[country].forEach(city => {
                const opt = document.createElement('option');
                opt.value = city;
                cityLocations.appendChild(opt);
            });
        }
    }

    countryCodeSelect.addEventListener('change', updatePhoneFormat);
    locationCountrySelect.addEventListener('change', updateCitySuggestions);
    updatePhoneFormat();

    // ── Pill checkbox sync (fallback for browsers without CSS :has()) ──────────
    function syncPills() {
        document.querySelectorAll('.wizard-checkbox input[type="checkbox"]').forEach(function(cb) {
            cb.closest('label').classList.toggle('pill-checked', cb.checked);
        });
    }
    form.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            e.target.closest('label').classList.toggle('pill-checked', e.target.checked);
        }
    });
    syncPills(); // run once on load

    let currentStep = 1;

    // ─── Step navigation ────────────────────────────────────────────────────────
    function updateStep() {
        steps.forEach((card, i) => card.classList.toggle('active', i === currentStep - 1));
        stepItems.forEach((item, i) => item.classList.toggle('active', i === currentStep - 1));

        const pct = currentStep === totalSteps ? 100 : Math.round((currentStep - 1) / totalSteps * 100);
        progressBar.style.width = `${pct}%`;
        currentStepText.textContent = currentStep;
        totalStepsText.textContent = totalSteps;

        if (currentStep === totalSteps) {
            fillReviewCard();
            nextBtn.style.display = 'none';
            submitContainer.style.display = 'block';
            updateSubmitBtn();
        } else {
            nextBtn.style.display = 'inline-block';
            submitContainer.style.display = 'none';
        }
        if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    }

    // ─── Error display ───────────────────────────────────────────────────────────
    function clearError(field) {
        const el = field.parentNode.querySelector('.error-message');
        if (el) el.remove();
        field.style.borderColor = '';
    }

    function showError(field, msg) {
        clearError(field);
        const err = document.createElement('div');
        err.className = 'error-message';
        err.style.cssText = 'color:#ff6f6f;font-size:0.8rem;margin-top:4px;';
        err.textContent = msg;
        field.parentNode.appendChild(err);
        field.style.borderColor = '#ff6f6f';
    }

    function validateField(field) {
        clearError(field);
        const value = (field.value || '').trim();

        if (field.hasAttribute('required') && !value) {
            showError(field, 'This field is required.');
            return false;
        }
        if (value) {
            if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showError(field, 'Please enter a valid email address.');
                return false;
            }
            if (field.type === 'url') {
                try { new URL(value); } catch {
                    showError(field, 'Please enter a valid URL (include https://).');
                    return false;
                }
            }
            if (field.type === 'tel') {
                const maxDigits = parseInt(field.getAttribute('data-digits')) || 10;
                const clean = value.replace(/\D/g, '');
                if (clean.length < 5) { showError(field, 'Enter at least 5 digits.'); return false; }
                if (clean.length > maxDigits + 2) { showError(field, 'Too many digits.'); return false; }
            }
        }
        return true;
    }

    // Validate current step; returns true if all required fields pass
    function validateStep(stepNum) {
        const card = steps[stepNum - 1];
        const fields = card.querySelectorAll('input:not([type=file]):not([type=checkbox]), select, textarea');
        let valid = true;
        fields.forEach(field => {
            if (field.hasAttribute('required')) {
                if (!validateField(field)) valid = false;
            }
        });
        return valid;
    }

    // ─── Review card ─────────────────────────────────────────────────────────────
    function val(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }
    function checks(name) {
        return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(e => e.value).join(', ') || '';
    }
    // Returns [display_value, is_missing]
    function rv(id, required) {
        const v = val(id);
        return [v || '—', required && !v];
    }

    function fillReviewCard() {
        const review = document.getElementById('review-content');
        if (!review) return;

        const area = val('area');
        const code = countryCodeSelect.value || '';
        const phone = val('phone');
        const fullPhone = phone ? `${code} ${phone}` : '';

        // sections: [title, step, [[label, value, required?], ...]]
        const sections = [
            ['Personal Information', 1, [
                ['Full Name',   rv('full_name', true)],
                ['Email',       rv('email', true)],
                ['Phone',       [fullPhone || '—', false]],
                ['Country',     rv('location_country', true)],
                ['City',        rv('location', true)],
                ['LinkedIn',    rv('linkedin', true)],
            ]],
            ['Professional Snapshot', 2, [
                ['Current Role',    rv('current_role', true)],
                ['Company',         rv('current_company', true)],
                ['Experience',      rv('experience', true)],
                ['Degree',          rv('degree', true)],
                ['Field of Study',  rv('field', true)],
                ['University',      rv('university', true)],
            ]],
            ['CV & Portfolio', 3, [
                ['CV (required)', [document.getElementById('cv').files[0] ? document.getElementById('cv').files[0].name : '(not uploaded — required)', true && !document.getElementById('cv').files[0]]],
                ['Portfolio',   [val('portfolio') || '—', false]],
                ['GitHub',      [val('github') || '—', false]],
                ['Website',     [val('website') || '—', false]],
            ]],
            ['Eligibility & Availability', 4, [
                ['Work Type',       rv('work_type', true)],
                ['Start Date',      rv('start_date', true)],
                ['Work Preference', rv('work_preference', true)],
                ['Constraints',     [val('constraints') || '—', false]],
            ]],
            ['Motivation', 5, [
                ['Interest',        rv('interest', true)],
                ['Problems Enjoyed',[val('problems') || '—', false]],
            ]],
            ['Skills & Source', 6, [
                ['Primary Area',   rv('area', true)],
                ['General Skills', [checks('skills') || '—', false]],
                ['Heard From',     rv('source', true)],
            ]],
        ];

        // Specialized skill section
        if (area === 'database') {
            sections.push(['Database / Backend Details', 6, [
                ['Databases',           [checks('db_databases') || '—', false]],
                ['Query Languages',     [checks('db_query_tools') || '—', false]],
                ['Backend Languages',   [checks('db_backend_langs') || '—', false]],
                ['Experience Level',    [val('db_experience') || '—', false]],
                ['Designed/Optimized DB?', [val('db_optimized') || '—', false]],
                ['Description',         [val('db_desc') || '—', false]],
            ]]);
        } else if (area === 'ml') {
            sections.push(['Financial ML Details', 6, [
                ['Libraries / Tools',       [checks('ml_libs') || '—', false]],
                ['Financial Data Exp.',     [checks('ml_fin_data') || '—', false]],
                ['ML Concepts',             [checks('ml_concepts') || '—', false]],
                ['Experience Level',        [val('ml_experience') || '—', false]],
                ['Built ML on Fin. Data?',  [val('ml_built') || '—', false]],
                ['Description',             [val('ml_desc') || '—', false]],
            ]]);
        } else if (area === 'ai') {
            sections.push(['AI / LLM Details', 6, [
                ['Tools / Frameworks',  [checks('ai_tools') || '—', false]],
                ['Areas of Experience', [checks('ai_areas') || '—', false]],
                ['Languages',           [checks('ai_langs') || '—', false]],
                ['Experience Level',    [val('ai_experience') || '—', false]],
                ['Deployed AI App?',    [val('ai_deployed') || '—', false]],
                ['Description',         [val('ai_desc') || '—', false]],
            ]]);
        }

        let hasMissing = false;
        review.innerHTML = sections.map(([heading, stepNum, fields]) => {
            const sectionMissing = fields.some(([, [, missing]]) => missing);
            if (sectionMissing) hasMissing = true;

            const rows = fields.map(([label, [value, missing]]) => {
                if (missing) {
                    return `<li style="margin-bottom:5px;color:#ff6f6f;">
                        <strong>${label}:</strong>
                        <span style="background:#3a1a1a;padding:1px 6px;border-radius:3px;font-size:0.8rem;">
                            ⚠ Missing —
                            <a href="#" onclick="event.preventDefault(); window.__goToStep(${stepNum});"
                               style="color:#ff9999;text-decoration:underline;">Fill in Step ${stepNum}</a>
                        </span>
                    </li>`;
                }
                return `<li style="margin-bottom:5px;"><strong>${label}:</strong> ${value}</li>`;
            }).join('');

            const badge = sectionMissing
                ? `<span style="color:#ff6f6f;font-size:0.75rem;margin-left:8px;">⚠ Incomplete</span>`
                : `<span style="color:#00ff88;font-size:0.75rem;margin-left:8px;">✓</span>`;

            return `<li style="list-style:none;margin-bottom:18px;">
                <div style="font-size:0.82rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;
                            color:#00d4ff;margin-bottom:6px;border-bottom:1px solid #2a3f60;padding-bottom:4px;">
                    ${heading}${badge}
                </div>
                <ul style="padding-left:14px;margin:0;">${rows}</ul>
            </li>`;
        }).join('');

        // Global missing warning banner
        const existing = document.getElementById('review-missing-banner');
        if (existing) existing.remove();
        if (hasMissing) {
            const banner = document.createElement('div');
            banner.id = 'review-missing-banner';
            banner.style.cssText = 'background:#3a1a1a;border:1px solid #ff6f6f;border-radius:8px;padding:10px 14px;margin-bottom:16px;color:#ff9999;font-size:0.88rem;';
            banner.innerHTML = '⚠ Some required fields are missing. Click the <strong>"Fill in Step X"</strong> links below to complete them before submitting.';
            review.parentNode.insertBefore(banner, review);
        }

        updateSubmitBtn();
    }

    // Expose goToStep globally for inline onclick in review
    window.__goToStep = function(stepNum) {
        currentStep = stepNum;
        updateStep();
        setTimeout(() => {
            const card = steps[stepNum - 1];
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    // ─── Submit button enable/disable ────────────────────────────────────────────
    function updateSubmitBtn() {
        if (!submitBtn) return;
        let allFilled = true;
        Object.keys(REQUIRED_FIELDS).forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) allFilled = false;
        });
        // CV is required
        const cvField = document.getElementById('cv');
        if (!cvField || !cvField.files[0]) allFilled = false;
        submitBtn.disabled = !allFilled;
        submitBtn.title = allFilled ? '' : 'Please fill all required fields and upload your CV before submitting.';
    }

    // Re-check submit button when CV is selected
    document.getElementById('cv').addEventListener('change', () => {
        if (currentStep === totalSteps) fillReviewCard();
        updateSubmitBtn();
    });

    form.addEventListener('input', () => { if (currentStep === totalSteps) { fillReviewCard(); } });
    form.addEventListener('change', () => { if (currentStep === totalSteps) { fillReviewCard(); } });

    // ─── Phone sanitize ──────────────────────────────────────────────────────────
    form.addEventListener('input', function(e) {
        if (e.target.type !== 'tel') return;
        const maxDigits = parseInt(e.target.getAttribute('data-digits')) || 10;
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, maxDigits);
    });

    // ─── Save button ─────────────────────────────────────────────────────────────
    saveBtn.addEventListener('click', function() {
        saveFormToCache();
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#00d4ff,#00ff88);color:#000;padding:12px 20px;border-radius:8px;font-weight:bold;z-index:9999;';
        msg.textContent = '✓ Progress saved!';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);
    });

    // ─── Next button (with validation) ───────────────────────────────────────────
    nextBtn.addEventListener('click', function() {
        // Validate current step; show errors but still allow moving forward
        const valid = validateStep(currentStep);
        if (!valid) {
            // Show inline warning but allow skipping via a second click
            if (!nextBtn.dataset.warnShown) {
                nextBtn.dataset.warnShown = '1';
                nextBtn.textContent = 'Continue anyway →';
                nextBtn.style.background = 'linear-gradient(135deg,#ff9900,#ff6f00)';
                return;
            }
        }
        // Reset button appearance
        nextBtn.dataset.warnShown = '';
        nextBtn.textContent = 'Next';
        nextBtn.style.background = '';

        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });

    // ─── Previous button ─────────────────────────────────────────────────────────
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentStep > 1) { currentStep--; updateStep(); }
        });
    }

    // ─── Sidebar step click ───────────────────────────────────────────────────────
    stepItems.forEach((item) => {
        item.addEventListener('click', function() {
            const step = parseInt(item.dataset.step);
            if (!step || isNaN(step)) return;
            currentStep = step;
            updateStep();
        });
    });

    // ─── Form submit ──────────────────────────────────────────────────────────────
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Check required text/select fields
        let firstBadStep = null;
        for (const [id, stepNum] of Object.entries(REQUIRED_FIELDS)) {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) {
                if (!firstBadStep) firstBadStep = stepNum;
            }
        }

        if (firstBadStep) {
            currentStep = firstBadStep;
            updateStep();
            validateStep(firstBadStep);
            steps[firstBadStep - 1].scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Check CV upload (required)
        const cvField = document.getElementById('cv');
        if (!cvField.files[0]) {
            showError(cvField, 'Please upload your CV (PDF) before submitting.');
            currentStep = 3; // CV is on step 3
            updateStep();
            cvField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (cvField.files[0].type !== 'application/pdf') {
            showError(cvField, 'Only PDF files are accepted.');
            currentStep = 3;
            updateStep();
            cvField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Mark as submitted BEFORE posting — page will be read-only on return
        localStorage.setItem('applicationSubmitted', 'true');
        // Keep formCache so the review page can still show filled data
        form.submit();
    });

    // ─── Sample data ──────────────────────────────────────────────────────────────
    function fillSampleData() {
        document.getElementById('full_name').value = 'Alex Johnson';
        document.getElementById('email').value = 'alex.johnson@email.com';
        countryCodeSelect.value = '+91';
        updatePhoneFormat();
        document.getElementById('phone').value = '9876543210';
        locationCountrySelect.value = 'India';
        updateCitySuggestions();
        document.getElementById('location').value = 'Bangalore';
        document.getElementById('linkedin').value = 'https://linkedin.com/in/alexjohnson';

        document.getElementById('current_role').value = 'Software Engineer';
        document.getElementById('current_company').value = 'TechCorp Solutions';
        document.getElementById('experience').value = '3-5';
        document.getElementById('degree').value = 'B.Tech';
        document.getElementById('field').value = 'Computer Science';
        document.getElementById('university').value = 'IIT Bangalore';

        document.getElementById('portfolio').value = 'https://alexjohnson.dev';
        document.getElementById('github').value = 'https://github.com/alexjohnson';
        document.getElementById('website').value = 'https://alexjohnson.blog';

        document.getElementById('work_type').value = 'full-time';
        document.getElementById('start_date').value = '2026-05-01';
        document.getElementById('work_preference').value = 'hybrid';
        document.getElementById('constraints').value = 'Prefer not to travel more than once a month.';

        document.getElementById('interest').value = 'I am deeply interested in TalentForge because of its cutting-edge use of AI and data systems to solve real-world hiring challenges. Working on impactful products at scale aligns perfectly with my career goals.';
        document.getElementById('problems').value = 'I enjoy solving scalability problems in data pipelines and building intelligent systems that reduce manual effort through automation and smart design.';

        document.getElementById('area').value = 'ai';
        updateSpecializedSection();

        [['ai_tools',  ['OpenAI APIs','LangChain','Hugging Face','Vector DBs']],
         ['ai_areas',  ['Prompt engineering','RAG','AI agents']],
         ['ai_langs',  ['Python','JavaScript']],
         ['skills',    ['python','ml','apis']]
        ].forEach(([name, vals]) => {
            vals.forEach(v => {
                const cb = form.querySelector(`input[name="${name}"][value="${v}"]`);
                if (cb) cb.checked = true;
            });
        });

        document.getElementById('ai_experience').value = 'Intermediate';
        document.getElementById('ai_deployed').value = 'Yes';
        document.getElementById('ai_desc').value = 'Built a RAG-based document Q&A chatbot using LangChain, OpenAI APIs, and Pinecone vector DB, deployed on AWS Lambda for production use.';
        document.getElementById('source').value = 'linkedin';

        saveFormToCache();
    }

    // ─── LocalStorage cache ───────────────────────────────────────────────────────
    function saveFormToCache() {
        const data = new FormData(form);
        const cache = {};
        data.forEach((value, key) => {
            if (key === 'cv') return;
            if (cache[key]) {
                if (!Array.isArray(cache[key])) cache[key] = [cache[key]];
                cache[key].push(value);
            } else {
                cache[key] = value;
            }
        });
        localStorage.setItem('formCache', JSON.stringify(cache));
        localStorage.setItem('formCacheTimestamp', new Date().toISOString());
    }

    function loadFormFromCache() {
        const cached = localStorage.getItem('formCache');
        if (!cached) return false;
        try {
            const cache = JSON.parse(cached);
            Object.entries(cache).forEach(([key, value]) => {
                try {
                    if (Array.isArray(value)) {
                        value.forEach(v => {
                            const cb = form.querySelector(`input[name="${key}"][value="${v}"]`);
                            if (cb) cb.checked = true;
                        });
                    } else if (value) {
                        const el = form.querySelector(`[name="${key}"]`);
                        if (el && el.type !== 'file') el.value = value;
                    }
                } catch (_) {}
            });
            locationCountrySelect.dispatchEvent(new Event('change'));
            countryCodeSelect.dispatchEvent(new Event('change'));
            updateSpecializedSection();
            return true;
        } catch (e) {
            return false;
        }
    }

    // Auto-save on input
    let isLoading = true;
    let autoSaveTimeout;
    form.addEventListener('input', () => { if (!isLoading) { clearTimeout(autoSaveTimeout); autoSaveTimeout = setTimeout(saveFormToCache, 500); } });
    form.addEventListener('change', () => { if (!isLoading) { clearTimeout(autoSaveTimeout); autoSaveTimeout = setTimeout(saveFormToCache, 500); } });

    // ─── Read-only mode (application already submitted) ───────────────────────
    function applyReadOnlyMode(assessmentDone) {
        // Disable every field
        form.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
        });

        // Hide action buttons
        if (nextBtn)         nextBtn.style.display         = 'none';
        if (prevBtn)         prevBtn.style.display         = 'none';
        if (saveBtn)         saveBtn.style.display         = 'none';
        if (submitContainer) submitContainer.style.display = 'none';

        // Submitted banner
        const banner = document.createElement('div');
        banner.style.cssText = [
            'display:flex', 'align-items:center', 'gap:12px',
            'background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(0,255,136,0.08))',
            'border:1px solid rgba(0,212,255,0.3)',
            'border-radius:12px', 'padding:12px 18px', 'margin-bottom:18px',
            'font-size:0.9rem', 'color:#c6f7ff'
        ].join(';');
        const bannerTitle   = assessmentDone ? 'Application &amp; Assessments Completed' : 'Application Submitted';
        const bannerSubtext = assessmentDone
            ? 'All assessments have been submitted. This form and assessments are fully locked.'
            : 'This form is read-only. Use the steps to review your responses.';
        banner.innerHTML = `
            <span style="font-size:1.5rem;">&#x2705;</span>
            <div style="flex:1;">
                <strong style="color:#00ff88;display:block;margin-bottom:3px;">${bannerTitle}</strong>
                <span style="color:#7aa8c4;font-size:0.82rem;">${bannerSubtext}</span>
            </div>
            <button type="button" id="new-candidate-btn"
                style="background:linear-gradient(135deg,#00d4ff,#00ff88);color:#000;
                       border:none;border-radius:8px;padding:8px 16px;
                       font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;">
                New Candidate &#x2192;
            </button>`;
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(banner, mainContent.firstChild);

        document.getElementById('new-candidate-btn').addEventListener('click', function () {
            var keys = [
                'formCache', 'formCacheTimestamp', 'applicationSubmitted',
                'iq_completed', 'sk_completed', 'games_completed', 'assessmentCompleted',
                'tf_iq', 'tf_skillset', 'tf_games'
            ];
            keys.forEach(function (k) { localStorage.removeItem(k); });
            localStorage.setItem('new_candidate', 'true');
            window.location.href = '/';
        });

        // Replace nav buttons with read-only Prev / Next for browsing only
        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            navButtons.innerHTML = `
                <button type="button" id="ro-prev" class="nav-btn prev-btn" style="display:none;">&#8592; Previous</button>
                <button type="button" id="ro-next" class="nav-btn">Next &#8594;</button>`;

            const roPrev = document.getElementById('ro-prev');
            const roNext = document.getElementById('ro-next');

            function syncRONav() {
                roPrev.style.display = currentStep > 1           ? 'inline-block' : 'none';
                roNext.style.display = currentStep < totalSteps  ? 'inline-block' : 'none';
            }
            roPrev.addEventListener('click', () => { if (currentStep > 1)          { currentStep--; updateStep(); syncRONav(); } });
            roNext.addEventListener('click', () => { if (currentStep < totalSteps) { currentStep++; updateStep(); syncRONav(); } });
            syncRONav();
            stepItems.forEach(item => item.addEventListener('click', () => setTimeout(syncRONav, 0)));
        }

        // Locked field appearance
        const s = document.createElement('style');
        s.textContent = `
            #application-form input:disabled,
            #application-form select:disabled,
            #application-form textarea:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                border-color: rgba(52,102,162,0.18) !important;
                background: rgba(6,10,18,0.65) !important;
                color: #8aa0bc !important;
            }
            .wizard-checkbox label {
                cursor: not-allowed;
                pointer-events: none;
            }
        `;
        document.head.appendChild(s);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────────
    totalStepsText.textContent = totalSteps;
    updateStep();

    setTimeout(() => {
        const isNewCandidate = localStorage.getItem('new_candidate') === 'true';
        if (isNewCandidate) localStorage.removeItem('new_candidate');
        const loaded = loadFormFromCache();
        if (!loaded && !isNewCandidate) fillSampleData();
        syncPills();
        isLoading = false;

        if (localStorage.getItem('applicationSubmitted') === 'true') {
            const assessmentDone = localStorage.getItem('assessmentCompleted') === 'true';
            applyReadOnlyMode(assessmentDone);
        }
    }, 150);
});
