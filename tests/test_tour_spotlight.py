from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000', wait_until='networkidle')
    page.wait_for_timeout(3000)

    # Wait for dashboard to finish loading
    page.wait_for_selector('text=Active Contributors', timeout=10000)
    print("Dashboard loaded successfully.")

    # Check if welcome banner is present; if so, dismiss or start tour from it
    banner_btn = page.query_selector('button:has-text("Mulai Tur")')
    if banner_btn and banner_btn.is_visible():
        print("Found welcome banner! Clicking 'Mulai Tur'...")
        banner_btn.click()
    else:
        print("Clicking 'Panduan' button...")
        page.click('button:has-text("Panduan")')
        page.wait_for_selector('button:has-text("Buka Tur Visual")', timeout=5000)
        print("Clicking 'Buka Tur Visual'...")
        page.click('button:has-text("Buka Tur Visual")')

    page.wait_for_timeout(1000)

    # We are on Step 1. Wait for 'Selanjutnya' button
    page.wait_for_selector('button:has-text("Selanjutnya")', timeout=5000)
    print("Step 1 active. Advancing to Step 2 (Pencarian AI)...")
    page.click('button:has-text("Selanjutnya")')
    page.wait_for_timeout(1200)

    # Capture verification screenshot of Step 2
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step2_verified.png')
    print("Screenshot saved to tour_step2_verified.png!")

    # Verify mask and spotlight
    mask = page.query_selector('#tour-spotlight-mask')
    print("Mask in DOM:", mask is not None)
    if mask:
        rect = mask.query_selector('rect[fill="black"]')
        if rect:
            print("Mask hole attributes:", {
                "x": rect.get_attribute("x"),
                "y": rect.get_attribute("y"),
                "w": rect.get_attribute("width"),
                "h": rect.get_attribute("height")
            })

    browser.close()
