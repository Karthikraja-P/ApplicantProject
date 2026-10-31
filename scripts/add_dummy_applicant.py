import requests
import json
import time

API_BASE = "https://ddlcgice0qu4d.cloudfront.net"

def add_dummy():
    email = f"dummy_{int(time.time())}@example.com"
    print(f"Adding dummy applicant: {email}")

    # 1. Main Application
    app_data = {
        "email": email,
        "full_name": "Caveman Dummy",
        "country_code": "+1",
        "phone": "5551234567",
        "location_country": "USA",
        "location": "Cave Cave",
        "linkedin": "https://linkedin.com/in/caveman",
        "github": "https://github.com/caveman",
        "current_role": "Hunter Gatherer",
        "current_company": "Prehistoric Inc",
        "experience": "5",
        "degree": "Bachelors",
        "field": "Rock Engineering",
        "university": "Fire University",
        "work_type": "full-time",
        "start_date": "2026-05-01",
        "work_preference": "remote",
        "area": "ai",
        "interest": "I love rocks and AI",
        "problems": "No problems, just rocks",
        "source": "Cave Talk",
        # Added missing fields
        "db_realtime_data": "Professionally",
        "db_high_volume": "Professionally",
        "db_latency_impact": "Professionally",
        "ai_deployed_production": "Professional",
        "ai_finetune_systematic": "Both",
        "ai_programmatic_integration": "Built Integration",
        # Added skill levels
        "exp_Python": "Expert",
        "exp_PostgreSQL": "Advanced",
        "exp_AI_Hosted": "Expert"
    }

    resp = requests.post(f"{API_BASE}/submit", json=app_data)
    print(f"Submit Application: {resp.status_code}")
    print(resp.json())

    if resp.status_code != 200:
        return

    # 2. Assessment Scores
    scores = {
        "applicant": {"email": email},
        "scores": {
            "iq": {
                "score": 85,
                "total": 100,
                "pct": 85,
                "tier": "High",
                "percentile": "90",
                "time_taken": 300,
                "responses": [1, 0, 1]
            },
            "skillset": {
                "track": "ai",
                "correct": 45,
                "total": 50,
                "pct": 90,
                "tier": "Expert",
                "time_taken": 600,
                "responses": [1, 1, 1]
            },
            "games": {
                "bart": {"profile": "Moderate Risk", "avg_pumps": 7.5, "exploded": 3, "banked": 4.50, "responses": [7, 8, 6]},
                "igt": {"profile": "Cautious", "good_pct": 75, "balance": 2450, "trials": 40, "responses": [2, 3, 2]},
                "time_taken": 450
            }
        }
    }

    resp = requests.post(f"{API_BASE}/submit-final", json=scores)
    print(f"Submit Scores: {resp.status_code}")
    print(resp.json())

if __name__ == "__main__":
    add_dummy()
