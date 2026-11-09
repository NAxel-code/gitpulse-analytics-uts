from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # Intercept network responses
    def handle_response(response):
        if "timeline" in response.url:
            print("[TIMELINE API RESPONSE]:", response.status, response.json())
            
    page.on("response", handle_response)
    
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)
    
    print("Clicking gitpulse-analytics...")
    page.click("text=gitpulse-analytics")
    page.wait_for_timeout(4000)
    
    # Extract Area path d attribute
    paths = page.query_selector_all(".recharts-area-area")
    for i, path in enumerate(paths):
        print(f"Path {i} 'd':", path.get_attribute("d"))
        
    browser.close()
