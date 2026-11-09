import random
import uuid
from datetime import datetime, timedelta
from app.services.storage import get_storage

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
    "https://omnipulse.io/product/enterprise-suite",
    "https://omnipulse.io/checkout/signup",
    "https://omnipulse.io/checkout/success"
]

DEVICES = ["Desktop", "Desktop", "Mobile (iOS)", "Mobile (Android)", "Tablet"]

def generate_mock_data(days: int = 14, events_per_day: int = 250):
    storage = get_storage()
    events = []
    base_time = datetime.utcnow() - timedelta(days=days)

    print(f"Generating realistic mock dataset for {days} days...")

    for day in range(days):
        current_date = base_time + timedelta(days=day)
        # Random daily fluctuation
        daily_count = int(events_per_day * random.uniform(0.8, 1.35))
        
        for _ in range(daily_count):
            camp = random.choices(CAMPAIGNS, weights=[30, 25, 20, 8, 10, 15])[0]
            device = random.choice(DEVICES)
            user_id = str(uuid.uuid4())
            session_id = str(uuid.uuid4())
            event_hour = random.randint(0, 23)
            event_minute = random.randint(0, 59)
            event_time = current_date.replace(hour=event_hour, minute=event_minute, second=random.randint(0, 59))

            # Step 1: Page View (Always)
            events.append({
                "timestamp": event_time,
                "event_id": str(uuid.uuid4()),
                "workspace_id": "default-workspace",
                "event_name": "page_view",
                "session_id": session_id,
                "user_pseudo_id": user_id,
                "page_url": random.choice(PAGES[:3]),
                "utm_source": camp["source"],
                "utm_medium": camp["medium"],
                "utm_campaign": camp["campaign"],
                "utm_term": "growth_analytics",
                "utm_content": "banner_variant_a",
                "conversion_value": 0.0,
                "currency": "USD",
                "user_agent_device": device
            })

            # Step 2: Product Discovery (60% chance)
            if random.random() < 0.65:
                events.append({
                    "timestamp": event_time + timedelta(seconds=random.randint(15, 60)),
                    "event_id": str(uuid.uuid4()),
                    "workspace_id": "default-workspace",
                    "event_name": "product_view",
                    "session_id": session_id,
                    "user_pseudo_id": user_id,
                    "page_url": random.choice(PAGES[3:5]),
                    "utm_source": camp["source"],
                    "utm_medium": camp["medium"],
                    "utm_campaign": camp["campaign"],
                    "utm_term": "growth_analytics",
                    "utm_content": "cta_click",
                    "conversion_value": 0.0,
                    "currency": "USD",
                    "user_agent_device": device
                })

            # Step 3: Conversion / Lead or Purchase
            if random.random() < camp["conv_rate"]:
                is_purchase = random.random() < 0.40
                conv_name = "purchase" if is_purchase else "lead"
                val = round(camp["avg_val"] * random.uniform(0.7, 1.4), 2) if is_purchase else 0.0

                events.append({
                    "timestamp": event_time + timedelta(seconds=random.randint(90, 240)),
                    "event_id": str(uuid.uuid4()),
                    "workspace_id": "default-workspace",
                    "event_name": conv_name,
                    "session_id": session_id,
                    "user_pseudo_id": user_id,
                    "page_url": PAGES[6] if is_purchase else PAGES[5],
                    "utm_source": camp["source"],
                    "utm_medium": camp["medium"],
                    "utm_campaign": camp["campaign"],
                    "utm_term": "growth_analytics",
                    "utm_content": "conversion_trigger",
                    "conversion_value": val,
                    "currency": "USD",
                    "user_agent_device": device
                })

    storage.insert_events(events)
    print(f"Successfully populated DuckDB with {len(events)} realistic analytics events!")

if __name__ == "__main__":
    generate_mock_data(days=14, events_per_day=350)
