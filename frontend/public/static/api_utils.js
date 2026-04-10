/**
 * Singularity API Utilities
 * Used for communication with AWS Lambda backend via API Gateway.
 */

window.API_BASE_URL = window.API_BASE_URL || ''; // CloudFront routes /submit etc directly

async function apiSaveDraft(email, draftData) {
    // Existing backend doesn't have a specific /save for drafts, 
    // so we maintain it in localStorage.
    return { status: 'success', localOnly: true };
}

async function apiSubmitAssessment(email, type, results) {
    if (!email || !email.includes('@')) return;
    try {
        const response = await fetch(`${window.API_BASE_URL}/submit-final`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                applicant: { email: email },
                scores: { [type]: results }
            })
        });
        return await response.json();
    } catch (err) {
        console.error('API Submit Assessment failed:', err);
        return { error: 'Save failed' };
    }
}

