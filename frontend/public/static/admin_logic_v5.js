// ── Admin Dashboard Logic ──────────────────────────────────────────────────────
// Data is fetched ONCE on load. All filtering and sorting is done client-side.

let _allApps = [];
let _sortKey = 'submitted_at';
let _sortDir = -1; // -1 for desc, 1 for asc (default newest first)

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Attach listeners to filters
    ['f-date', 'f-location', 'f-area', 'f-experience', 'f-min-iq'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });

    document.getElementById('f-search').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('f-min-iq').addEventListener('input', debounce(applyFilters, 300));
});

function resetFilters() {
    ['f-date', 'f-location', 'f-area', 'f-experience', 'f-min-iq', 'f-search'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
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

async function loadData() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';

    const adminPass = localStorage.getItem('tf_admin_pass') || '';
    const apiBase = window.API_BASE_URL || '';

    try {
        console.log('Fetching admin data...');
        const response = await fetch(`${apiBase}/admin/applications?json=1`, {
            headers: { 'X-Admin-Pass': adminPass }
        });

        if (response.status === 401) {
            console.warn('Unauthorized. Redirecting to login.');
            window.location.href = '/admin_login.html';
            return;
        }

        const data = await response.json();
        console.log('Data received:', data.applications?.length || 0, 'records');

        // Add an 'idx' field for stable sorting by original arrival
        _allApps = (data.applications || []).map((a, i) => ({ ...a, idx: i + 1 }));

        populateFilterOptions(data.options || {});
        applyFilters();
    } catch (err) {
        console.error('CRITICAL: Failed to load admin data:', err);
        const body = document.getElementById('data-body');
        if (body) {
            body.innerHTML = `<tr><td colspan="17" style="color:#ff6b6b;text-align:center;padding:40px;">
                <div style="font-weight:700;margin-bottom:8px;">CONNECTION ERROR</div>
                <div style="font-size:0.9rem;opacity:0.8;">${err.message}</div>
                <button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:#ff6b6b;color:#fff;border:none;border-radius:4px;cursor:pointer;">Retry</button>
            </td></tr>`;
        }
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function populateFilterOptions(options) {
    populateSelect('f-date', options.dates || [], 'All Dates');
    populateSelect('f-location', options.location || [], 'All Locations');
    populateSelect('f-area', options.area || [], 'All Areas');
}

function populateSelect(id, opts, placeholder) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="">${placeholder}</option>` +
        opts.map(o => `<option value="${o}" ${o === current ? 'selected' : ''}>${o}</option>`).join('');
}

function applyFilters() {
    const dateVal = document.getElementById('f-date').value;
    const locationVal = document.getElementById('f-location').value;
    const areaVal = document.getElementById('f-area').value;
    const expVal = document.getElementById('f-experience').value;
    const minIQ = parseFloat(document.getElementById('f-min-iq').value || 0);
    const searchVal = document.getElementById('f-search').value.toLowerCase().trim();

    let filtered = _allApps.filter(app => {
        if (dateVal && !(app.submitted_at || '').startsWith(dateVal)) return false;
        if (locationVal && app.location_country !== locationVal) return false;
        if (areaVal && app.area !== areaVal) return false;
        if (expVal && app.experience !== expVal) return false;
        if (minIQ && parseFloat(app.iq_score || 0) < minIQ) return false;

        if (searchVal) {
            const hay = [app.full_name, app.email, app.current_role, app.current_company,
            app.skills, app.interest, app.location, app.university, app.area].join(' ').toLowerCase();
            if (!hay.includes(searchVal)) return false;
        }
        return true;
    });

    // Handle Sorting
    filtered.sort((a, b) => {
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

    updateStats(filtered);
    renderTable(filtered);
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
                    ${app.linkedin ? `<a href="${app.linkedin}"  target="_blank" title="LinkedIn"  style="font-size:1.2rem;text-decoration:none;">🔗</a>` : ''}
                    ${app.github ? `<a href="${app.github}"    target="_blank" title="GitHub"    style="font-size:1.2rem;text-decoration:none;">🐙</a>` : ''}
                    ${app.portfolio ? `<a href="${app.portfolio}" target="_blank" title="Portfolio" style="font-size:1.2rem;text-decoration:none;">💼</a>` : ''}
                    ${app.website ? `<a href="${app.website}"   target="_blank" title="Website"   style="font-size:1.2rem;text-decoration:none;">🌐</a>` : ''}
                    ${app.cv_key ? `<a href="/admin/cv/${app.cv_key}" target="_blank" title="View CV" style="font-size:1.2rem;text-decoration:none;">📄</a>` : ''}
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

async function exportCSV() {
    const adminPass = localStorage.getItem('tf_admin_pass') || '';
    const apiBase = window.API_BASE_URL || '';

    try {
        const response = await fetch(`${apiBase}/admin/export/csv?_cb=${Date.now()}`, {
            headers: { 'X-Admin-Pass': adminPass }
        });
        if (response.status === 401) { alert('Session expired. Please login again.'); window.location.href = '/admin_login.html'; return; }
        if (!response.ok) {
            const errText = await response.text();
            alert(`Export failed with status ${response.status}. Please check console for details.`);
            console.error('Export Error Body:', errText);
            return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nowStr = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-');
        a.download = `applicants_TEST_FIX_V4_${nowStr}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed completely. Check console.');
    }
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
