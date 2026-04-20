// ── Admin Dashboard Logic ──────────────────────────────────────────────────────
// Data is fetched ONCE on load. All filtering and sorting is done client-side.

let _allApps = [];
let _filteredApps = [];
let _sortKey = 'submitted_at';
let _sortDir = -1; // -1 for desc, 1 for asc (default newest first)

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Initialize Flatpickr for Date Range
    const fpConfig = {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        theme: "dark",
        onChange: applyFilters
    };

    if (window.flatpickr) {
        window.fpFrom = flatpickr("#f-date-from", fpConfig);
        window.fpTo = flatpickr("#f-date-to", fpConfig);
    }
});

function resetFilters() {
    if (window.fpFrom) window.fpFrom.clear();
    if (window.fpTo) window.fpTo.clear();
    applyFilters();
}

function setSort(key) {
    if (_sortKey === key) {
        _sortDir *= -1;
    } else {
        _sortKey = key;
        _sortDir = (key === 'submitted_at' || key.includes('score')) ? -1 : 1;
    }
    applyFilters();
}

const DUMMY_DATA = [
    {
        id: '1',
        submitted_at: '2026-04-20T10:15:00Z',
        full_name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        country_code: '+1',
        phone: '555-0123',
        source: 'LinkedIn',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        location: 'San Francisco',
        location_country: 'USA',
        area: 'AI / ML',
        current_role: 'Senior ML Engineer',
        current_company: 'Neural Dynamics',
        degree: 'Masters',
        field: 'Computer Science',
        experience: '6',
        work_type: 'Full-time',
        work_preference: 'Remote',
        start_date: '2026-05-15',
        iq_score: '142',
        iq_pct: '99',
        tech_score: '95',
        sk_pct: '98',
        game_balloon: 'Balanced',
        game_iq: 'High',
        cv_key: 'dummy_alex.pdf',
        interest: 'Passionate about Large Language Models and agentic workflows.'
    },
    {
        id: '2',
        submitted_at: '2026-04-19T14:30:00Z',
        full_name: 'Sarah Chen',
        email: 'schen.dev@example.com',
        country_code: '+44',
        phone: '7700 900123',
        source: 'GitHub',
        github: 'https://github.com',
        portfolio: 'https://sarah.dev',
        location: 'London',
        location_country: 'UK',
        area: 'Backend',
        current_role: 'Software Architect',
        current_company: 'FinTech Solutions',
        degree: 'Bachelors',
        field: 'Software Engineering',
        experience: '4',
        work_type: 'Contract',
        work_preference: 'Hybrid',
        start_date: '2026-06-01',
        iq_score: '128',
        iq_pct: '94',
        tech_score: '88',
        sk_pct: '90',
        game_balloon: 'Cautious',
        game_iq: 'Moderate',
        cv_key: 'dummy_sarah.pdf',
        interest: 'Interested in building scalable distributed systems.'
    },
    {
        id: '3',
        submitted_at: '2026-04-18T09:00:00Z',
        full_name: 'Marco Rossi',
        email: 'm.rossi@example.com',
        country_code: '+39',
        phone: '333 1234567',
        source: 'Direct',
        website: 'https://marcorossi.it',
        location: 'Milan',
        location_country: 'Italy',
        area: 'Fullstack',
        current_role: 'Lead Developer',
        current_company: 'Creative Studio',
        degree: 'Bachelors',
        field: 'Information Technology',
        experience: '8',
        work_type: 'Full-time',
        work_preference: 'On-site',
        start_date: '2026-05-01',
        iq_score: '115',
        iq_pct: '85',
        tech_score: '91',
        sk_pct: '93',
        game_balloon: 'Risky',
        game_iq: 'High',
        cv_key: 'dummy_marco.pdf',
        interest: 'Expert in React and Node.js ecosystems.'
    }
];

async function loadData() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    const apiBase = window.API_BASE_URL || '';

    try {
        console.log('Fetching admin data...');
        const response = await fetch(`${apiBase}/admin/applications?json=1`, {
            credentials: 'include'
        });

        if (response.status === 401) {
            console.warn('Unauthorized. Redirecting to login.');
            window.location.href = '/admin_login.html';
            return;
        }

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        console.log('Data received:', data.applications?.length || 0, 'records');

        _allApps = (data.applications || []).map((a, i) => ({ ...a, idx: i + 1 }));
        populateFilterOptions(data.options || {});
        applyFilters();
    } catch (err) {
        console.warn('Backend unavailable. Using dummy data for local testing.', err);
        
        // Use dummy data as fallback
        _allApps = DUMMY_DATA.map((a, i) => ({ ...a, idx: i + 1 }));
        
        // Generate mock dates for the filter
        const mockOptions = {
            dates: [...new Set(DUMMY_DATA.map(a => a.submitted_at.split('T')[0]))].sort().reverse()
        };
        
        populateFilterOptions(mockOptions);
        applyFilters();
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function populateFilterOptions(options) {
    // Single date dropdown is removed, no need to populate f-date
}

function populateSelect(id, opts, placeholder) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="">${placeholder}</option>` +
        opts.map(o => `<option value="${o}" ${o === current ? 'selected' : ''}>${o}</option>`).join('');
}

function applyFilters() {
    const dateFrom = document.getElementById('f-date-from').value; // YYYY-MM-DD
    const dateTo = document.getElementById('f-date-to').value;     // YYYY-MM-DD

    _filteredApps = _allApps.filter(app => {
        if (dateFrom || dateTo) {
            const appDate = (app.submitted_at || '').substring(0, 10); // YYYY-MM-DD
            if (dateFrom && appDate < dateFrom) return false;
            if (dateTo && appDate > dateTo) return false;
        }
        return true;
    });

    // Handle Sorting
    _filteredApps.sort((a, b) => {
        let vA = a[_sortKey];
        let vB = b[_sortKey];

        // Numerical conversion for scores/idx
        if (_sortKey.includes('score') || _sortKey === 'idx' || _sortKey === 'experience') {
            vA = parseFloat(vA) || 0;
            vB = parseFloat(vB) || 0;
        } else {
            vA = String(vA || '').toLowerCase();
            vB = String(vB || '').toLowerCase();
        }

        if (vA < vB) return -1 * _sortDir;
        if (vA > vB) return 1 * _sortDir;
        return 0;
    });

    updateStats(_filteredApps);
    renderTable(_filteredApps);
}

function updateStats(apps) {
    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.textContent = apps.length;

    const withIQ = apps.filter(a => parseFloat(a.iq_score) > 0);
    const withTech = apps.filter(a => parseFloat(a.tech_score) > 0);
    const avgIQ = withIQ.length ? (withIQ.reduce((s, a) => s + parseFloat(a.iq_score || 0), 0) / withIQ.length).toFixed(1) : '—';
    const avgTech = withTech.length ? (withTech.reduce((s, a) => s + parseFloat(a.tech_score || 0), 0) / withTech.length).toFixed(1) : '—';

    const avgIQEl = document.getElementById('stat-avg-iq');
    const avgTechEl = document.getElementById('stat-avg-tech');
    if (avgIQEl) avgIQEl.textContent = avgIQ;
    if (avgTechEl) avgTechEl.textContent = avgTech;
}

function renderTable(apps) {
    const body = document.getElementById('data-body');
    if (!body) return;

    if (!apps.length) {
        body.innerHTML = '<tr><td colspan="17" style="color:#5a7ca0;text-align:center;padding:40px;">No applicants match current filters.</td></tr>';
        return;
    }

    body.innerHTML = apps.map((app) => `
        <tr>
            <td style="text-align:center;color:#5a7ca0;">${app.idx}</td>
            <td style="font-size:0.95rem;color:#8ab4f8;">${(app.submitted_at || '').replace('T', '<br>').substring(0, 22)}</td>
            <td>
                <div style="font-weight:700;color:#fff;font-size:1.1rem;">${esc(app.full_name)}</div>
                <div style="font-size:0.95rem;color:#5a7ca0;">${esc(app.email)}</div>
            </td>
            <td>
                <div style="color:#00d4ff;font-size:0.95rem;">${esc(app.country_code)} ${esc(app.phone)}</div>
                <div style="font-size:0.85rem;color:#5a7ca0;">${esc(app.source || 'Direct')}</div>
            </td>
            <td>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${safeUrl(app.linkedin) ? `<a href="${safeUrl(app.linkedin)}"  target="_blank" rel="noopener noreferrer" title="LinkedIn"  style="font-size:1.2rem;text-decoration:none;">🔗</a>` : ''}
                    ${safeUrl(app.github) ? `<a href="${safeUrl(app.github)}"    target="_blank" rel="noopener noreferrer" title="GitHub"    style="font-size:1.2rem;text-decoration:none;">🐙</a>` : ''}
                    ${safeUrl(app.portfolio) ? `<a href="${safeUrl(app.portfolio)}" target="_blank" rel="noopener noreferrer" title="Portfolio" style="font-size:1.2rem;text-decoration:none;">💼</a>` : ''}
                    ${safeUrl(app.website) ? `<a href="${safeUrl(app.website)}"   target="_blank" rel="noopener noreferrer" title="Website"   style="font-size:1.2rem;text-decoration:none;">🌐</a>` : ''}
                    ${app.cv_key ? `<a href="${['1','2','3'].includes(app.id) ? '/static/mock_cv.html' : `/admin/cv/${esc(app.cv_key)}`}" target="_blank" rel="noopener noreferrer" title="View CV" style="font-size:1.2rem;text-decoration:none;">📄</a>` : ''}
                </div>
            </td>
            <td style="font-size:0.95rem;">${esc(app.location)}<br><span style="color:#5a7ca0;">${esc(app.location_country)}</span></td>
            <td><span style="background:rgba(0,212,255,0.1);color:#00d4ff;padding:4px 10px;border-radius:4px;font-weight:600;font-size:0.85rem;text-transform:uppercase;">${esc(app.area)}</span></td>
            <td style="font-size:0.95rem;">${esc(app.current_role)}<br><span style="color:#5a7ca0;">${esc(app.current_company)}</span></td>
            <td style="font-size:0.95rem;">${esc(app.degree)}<br><span style="color:#5a7ca0;">${esc(app.field)}</span></td>
            <td style="text-align:center;font-size:1rem;">${esc(app.experience || '0')}y</td>
            <td style="font-size:0.95rem;">${esc(app.work_type)}<br><span style="color:#5a7ca0;">${esc(app.work_preference)}</span></td>
            <td style="font-size:0.95rem;color:#aac4e8;">${esc(app.start_date)}</td>
            <td style="text-align:center;">
                ${scoreChip(app.iq_score, app.iq_pct, '#00d4ff')}
            </td>
            <td style="text-align:center;">
                ${scoreChip(app.tech_score, app.sk_pct, '#00ff88')}
            </td>
            <td style="font-size:0.9rem;color:#8ab4f8;text-align:center;line-height:1.6;">
                🎈${app.game_balloon || '—'}<br>🃏${app.game_iq || '—'}
            </td>
            <td style="max-width:200px;">
                <div style="font-size:0.85rem;color:#aac4e8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(app.interest)}">${esc(app.interest) || '<span style="color:#2a3f60">—</span>'}</div>
            </td>
            <td>
                <a href="/admin_detail.html?id=${encodeURIComponent(app.id)}" style="color:#00ff88;text-decoration:none;font-weight:600;font-size:0.95rem;white-space:nowrap;">View →</a>
            </td>
        </tr>
    `).join('');
}

function scoreChip(val, pct, color) {
    const v = parseFloat(val || 0);
    if (!v) return '<span style="color:#2a3f60;font-size:0.8rem;">—</span>';
    const p = pct ? `<span style="font-size:0.7rem;opacity:0.7;"> (${pct}%)</span>` : '';
    return `<span style="background:${color}22;color:${color};padding:2px 8px;border-radius:10px;font-weight:700;">${v}${p}</span>`;
}

function esc(v) {
    if (v == null || v === '') return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeUrl(v) {
    if (!v) return null;
    var u = String(v).trim();
    return /^https?:\/\//i.test(u) ? esc(u) : null;
}

async function downloadAllCVs() {
    const appsWithCV = _filteredApps.filter(app => app.cv_key);
    if (!appsWithCV.length) {
        alert("No CVs found for the filtered applicants.");
        return;
    }

    const btn = document.querySelector('.cv-bulk-btn');
    const originalContent = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = 'Zipping...';

        const zip = new JSZip();
        const apiBase = window.API_BASE_URL || 'https://ddlcgice0qu4d.cloudfront.net';

        const fetchPromises = appsWithCV.map(async (app) => {
            const fileName = `${app.full_name.replace(/\s+/g, '_')}_CV.pdf`;
            
            // Local dummy data fallback
            if (['1', '2', '3'].includes(app.id)) {
                zip.file(`${app.full_name.replace(/\s+/g, '_')}_MOCK_CV.txt`, `Mock CV content for ${app.full_name}.\nArea: ${app.area}\nEmail: ${app.email}`);
                return;
            }

            try {
                const url = `${apiBase}/admin/cv/${app.cv_key}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Fetch failed');
                
                const contentType = response.headers.get('content-type') || '';
                let blob;

                if (contentType.includes('text/html')) {
                    // Backend uses HTML meta-refresh to redirect to S3
                    const htmlText = await response.text();
                    const urlMatch = htmlText.match(/url=(.*?)"/);
                    if (urlMatch && urlMatch[1]) {
                        const s3Url = urlMatch[1].replace(/&amp;/g, '&');
                        const s3Resp = await fetch(s3Url);
                        if (!s3Resp.ok) throw new Error('S3 Fetch failed');
                        blob = await s3Resp.blob();
                    } else {
                        throw new Error('Could not find redirect URL in HTML');
                    }
                } else {
                    blob = await response.blob();
                }

                zip.file(fileName, blob);
            } catch (err) {
                console.warn(`Could not fetch real CV for ${app.full_name}, adding placeholder.`, err);
                zip.file(`${app.full_name.replace(/\s+/g, '_')}_LINK.txt`, `Link: ${apiBase}/admin/cv/${app.cv_key}`);
            }
        });

        await Promise.all(fetchPromises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `applicants_cv_bulk_${new Date().toISOString().split('T')[0]}.zip`);

        btn.style.background = '#00ff88';
        btn.innerHTML = '✓ Downloaded';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.style.background = '';
        }, 2000);

    } catch (err) {
        console.error('Bulk CV download failed:', err);
        alert('Bulk download failed. See console for details.');
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

async function exportCSV() {
    if (!_filteredApps.length) {
        alert("No data to export.");
        return;
    }

    const btn = document.querySelector('.export-btn');
    const originalContent = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = 'Exporting...';

        // Column mapping
        const columns = {
            submitted_at: 'Submission Date',
            full_name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            location: 'City',
            location_country: 'Country',
            area: 'Track/Area',
            current_role: 'Current Role',
            current_company: 'Current Company',
            experience: 'Years of Exp',
            degree: 'Degree',
            field: 'Field of Study',
            university: 'University',
            iq_score: 'IQ Score',
            tech_score: 'Tech Score',
            game_balloon: 'BART (Balloon)',
            game_iq: 'IGT (Behavioral)',
            interest: 'Interest',
            cv_key: 'CV Download Link'
        };

        const keys = Object.keys(columns);
        const headers = Object.values(columns);
        const apiBase = window.API_BASE_URL || 'https://ddlcgice0qu4d.cloudfront.net';

        // Build CSV string
        let csvContent = "\ufeff" + headers.join(",") + "\n";

        _filteredApps.forEach(app => {
            const row = keys.map(k => {
                let val = app[k] || '';
                
                // Format CV Link
                if (k === 'cv_key' && val) {
                    // Local fallback for dummy data
                    if (['1', '2', '3'].includes(app.id)) {
                        val = `${window.location.origin}/static/mock_cv.html`;
                    } else {
                        val = `${apiBase}/admin/cv/${val}`;
                    }
                }

                // Escape quotes and wrap in quotes
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            });
            csvContent += row.join(",") + "\n";
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().split('T')[0];
        
        link.setAttribute("href", url);
        link.setAttribute("download", `applicants_export_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        btn.style.background = '#00ff88';
        btn.innerHTML = '✓ Exported';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.style.background = '';
        }, 2000);

    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed.');
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

// Add CSS for the spinner if not already present
if (!document.getElementById('admin-logic-styles')) {
    const style = document.createElement('style');
    style.id = 'admin-logic-styles';
    style.textContent = `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .export-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
