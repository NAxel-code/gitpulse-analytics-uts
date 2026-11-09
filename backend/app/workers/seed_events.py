import random
import uuid
import httpx
from datetime import datetime, timedelta, timezone

CAMPAIGNS = [
    {"source": "google", "medium": "cpc", "campaign": "brand_search_q3", "conv_rate": 0.08, "avg_val": 120.0},
    {"source": "meta", "medium": "paid_social", "campaign": "retargeting_catalog_v2", "conv_rate": 0.065, "avg_val": 85.0},
    {"source": "tiktok", "medium": "short_video", "campaign": "viral_hook_trend_promo", "conv_rate": 0.042, "avg_val": 45.0},
    {"source": "linkedin", "medium": "sponsored_content", "campaign": "b2b_saas_executive_guide", "conv_rate": 0.095, "avg_val": 350.0},
    {"source": "email", "medium": "newsletter", "campaign": "weekly_growth_dispatch", "conv_rate": 0.12, "avg_val": 95.0},
    {"source": "direct", "medium": "none", "campaign": "direct_traffic", "conv_rate": 0.05, "avg_val": 70.0}
]

PAGES = [
    "https://omnipulse.io/",
    "https://omnipulse.io/features",
    "https://omnipulse.io/pricing",
    "https://omnipulse.io/product/analytics-pro",
    "https://omnipulse.io/checkout/signup",
    "https://omnipulse.io/checkout/success"
]

def seed_http_events(count: int = 400):
    events = []
    now = datetime.now(timezone.utc)
    
    for _ in range(count):
        camp = random.choices(CAMPAIGNS, weights=[30, 25, 20, 10, 10, 15])[0]
        days_ago = random.randint(0, 13)
        hours_ago = random.randint(0, 23)
        event_time = now - timedelta(days=days_ago, hours=hours_ago, minutes=random.randint(0, 59))
        
        user_id = str(uuid.uuid4())
        session_id = str(uuid.uuid4())
        
        # 1. Page view
        events.append({
            "timestamp": event_time.isoformat(),
            "event_name": "page_view",
            "session_id": session_id,
            "user_pseudo_id": user_id,
            "page_url": random.choice(PAGES[:3]),
            "utm_source": camp["source"],
            "utm_medium": camp["medium"],
            "utm_campaign": camp["campaign"],
            "conversion_value": 0.0
        })
        
        # 2. Conversion
        if random.random() < camp["conv_rate"]:
            is_purchase = random.random() < 0.45
            events.append({
                "timestamp": (event_time + timedelta(minutes=random.randint(2, 10))).isoformat(),
                "event_name": "purchase" if is_purchase else "lead",
                "session_id": session_id,
                "user_pseudo_id": user_id,
                "page_url": PAGES[5] if is_purchase else PAGES[4],
                "utm_source": camp["source"],
                "utm_medium": camp["medium"],
                "utm_campaign": camp["campaign"],
                "conversion_value": round(camp["avg_val"] * random.uniform(0.8, 1.3), 2) if is_purchase else 0.0
            })

    print(f"Sending {len(events)} events in batches to http://127.0.0.1:8000/api/v1/events/ingest ...")
    batch_size = 50
    with httpx.Client(timeout=10.0) as client:
        for i in range(0, len(events), batch_size):
            batch = events[i:i + batch_size]
            res = client.post("http://127.0.0.1:8000/api/v1/events/ingest", json=batch)
            if res.status_code != 202:
                print(f"Error: {res.text}")
    print("Done seeding events!")

if __name__ == "__main__":
    seed_http_events(350)
