/**
 * assessment_lock.js
 * Shared helper — must be loaded BEFORE any assessment JS on every assessment page.
 */

/**
 * Builds an HTML string for the "assessment already completed" state.
 * @param {string} title      - Assessment name, e.g. "🧠 General IQ Assessment"
 * @param {string} message    - Short explanation shown under the title
 * @param {Array}  links      - Array of { label, href } navigation links
 */
function buildCompletedBanner(title, message, links) {
    var linkHtml = links.map(function (l) {
        return '<a href="' + l.href + '" style="text-decoration:none;">'
            + '<button class="nav-btn" style="background:rgba(0,212,255,0.1);'
            + 'border:1px solid rgba(0,212,255,0.3);color:#00d4ff;">'
            + l.label + '</button></a>';
    }).join('');

    return '<div class="wizard-card active" style="text-align:center;padding:40px 32px;">'
        + '<div style="font-size:3rem;margin-bottom:16px;">&#x2705;</div>'
        + '<h2 style="color:#00ff88;margin:0 0 10px;">' + title + '</h2>'
        + '<p style="color:#7aa8c4;font-size:0.92rem;margin:0 0 28px;line-height:1.6;">'
        + message + '<br>'
        + '<span style="color:#3a5a72;font-size:0.82rem;">Your results have been recorded. No further changes are allowed.</span>'
        + '</p>'
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">'
        + linkHtml
        + '</div>'
        + '</div>';
}
