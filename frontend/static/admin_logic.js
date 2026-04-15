document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Attach filter listeners
    ['f-date', 'f-location', 'f-area'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => loadData());
    });
    document.getElementById('f-search').addEventListener('input', debounce(() => loadData(), 500));
});

async function loadData() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    const filters = {
        date_filter: document.getElementById('f-date').value,
        location_filter: document.getElementById('f-location').value,
        area: document.getElementById('f-area').value,
        search: document.getElementById('f-search').value,
        json: 1
    };

    const qs = new URLSearchParams(filters).toString();
    const adminPass = localStorage.getItem('tf_admin_pass') || '';
    const apiBase = window.API_BASE_URL || '';

    try {
        const response = await fetch(`${apiBase}/admin/applications?${qs}`, {
            headers: { 'X-Admin-Pass': adminPass }
        });

        if (response.status === 401) {
            window.location.href = '/admin_login.html';
            return;
        }
        const data = await response.json();

        updateStats(data.applications.length);
        updateFilters(data.options, data.filters);
        renderTable(data.applications);
    } catch (err) {
        console.error('Failed to load admin data:', err);
    } finally {
        loading.style.display = 'none';
    }
}

function updateStats(total) {
    document.getElementById('stat-total').textContent = total;
}

function updateFilters(options, active) {
    updateSelect('f-date', options.dates, active.date_filter);
    updateSelect('f-location', options.location, active.location_filter);
    updateSelect('f-area', options.area, active.area);
}

function updateSelect(id, opts, selected) {
    const el = document.getElementById(id);
    const currentVal = el.value;

    // Only rebuild options if they changed or were empty
    if (el.options.length > 1 && currentVal === selected) return;

    const firstOption = el.options[0].outerHTML;
    el.innerHTML = firstOption + opts.map(o =>
        `<option value="${o}" ${o === selected ? 'selected' : ''}>${o}</option>`
    ).join('');
}

function renderTable(apps) {
    const body = document.getElementById('data-body');
    body.innerHTML = apps.map((app, idx) => `
        <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="font-size: 0.85rem; color: #8ab4f8;">${(app.submitted_at || '').replace('T', '<br>')}</td>
            <td>
                <div style="font-weight: 700; color: #fff;">${app.full_name || ''}</div>
                <div style="font-size: 0.85rem; color: #5a7ca0;">${app.email || ''}</div>
            </td>
            <td>
                <div style="color: #00d4ff;">${app.country_code || ''} ${app.phone || ''}</div>
                <div style="font-size: 0.8rem; color: #5a7ca0;">${app.source || 'Direct'}</div>
            </td>
            <td>
                <div class="link-icons" style="display: flex; gap: 8px;">
                    ${app.linkedin ? `<a href="${app.linkedin}" target="_blank" title="LinkedIn">🔗</a>` : ''}
                    ${app.github ? `<a href="${app.github}" target="_blank" title="GitHub">🐙</a>` : ''}
                    ${app.portfolio ? `<a href="${app.portfolio}" target="_blank" title="Portfolio">💼</a>` : ''}
                    ${app.website ? `<a href="${app.website}" target="_blank" title="Website">🌐</a>` : ''}
                    ${app.cv_key ? `<a href="/admin/cv/${app.cv_key}" target="_blank" title="View CV">📄</a>` : ''}
                </div>
            </td>
            <td style="font-size: 0.85rem;">${app.location || ''}<br><span style="color:#5a7ca0">${app.location_country || ''}</span></td>
            <td><span class="area-badge" style="background: rgba(0, 212, 255, 0.1); color: #00d4ff; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">${app.area || ''}</span></td>
            <td style="font-size: 0.85rem;">${app.current_role || ''}<br><span style="color:#5a7ca0">${app.current_company || ''}</span></td>
            <td style="font-size: 0.85rem;">${app.degree || ''}<br><span style="color:#5a7ca0">${app.field || ''}</span></td>
            <td style="text-align: center;">${app.experience || '0'}y</td>
            <td style="font-size: 0.85rem;">${app.work_type || ''}<br><span style="color:#5a7ca0">${app.work_preference || ''}</span></td>
            <td style="font-size: 0.85rem;">${app.start_date || ''}</td>
            <td style="text-align: center;"><span class="score-pill score-iq" style="background: rgba(0, 212, 255, 0.2); color: #00d4ff; padding: 2px 8px; border-radius: 10px; font-weight:bold;">${app.iq_score || '0'}</span></td>
            <td style="text-align: center;"><span class="score-pill score-tech" style="background: rgba(0, 255, 136, 0.2); color: #00ff88; padding: 2px 8px; border-radius: 10px; font-weight:bold;">${app.tech_score || '0'}</span></td>
            <td style="font-size: 0.8rem; color: #8ab4f8; text-align: center;">B:${app.game_balloon || 0}<br>H:${app.game_height || 0}<br>I:${app.game_iq || 0}</td>
            <td title="${app.interest || ''}"><div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8rem;">${app.interest || ''}</div></td>
            <td>
                <a href="/admin_detail.html?id=${app.id}" class="view-link" style="color: #00ff88; text-decoration: none; font-weight: 600;">View Full</a>
            </td>
        </tr>
    `).join('');
}

async function exportCSV() {
    const adminPass = localStorage.getItem('tf_admin_pass') || '';
    const apiBase = window.API_BASE_URL || '';
    const filters = {
        date_filter: document.getElementById('f-date').value,
        location_filter: document.getElementById('f-location').value,
        area: document.getElementById('f-area').value,
        search: document.getElementById('f-search').value
    };
    const qs = new URLSearchParams(filters).toString();

    try {
        const response = await fetch(`${apiBase}/admin/export/csv?${qs}`, {
            headers: { 'X-Admin-Pass': adminPass }
        });
        if (response.status === 401) {
            alert('Unauthorized. Please login again.');
            return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applicants_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed.');
    }
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
