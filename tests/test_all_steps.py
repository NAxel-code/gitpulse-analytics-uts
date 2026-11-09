from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000')
    page.wait_for_timeout(3500)

    # Click Mulai Tur from banner or Buka Tur Visual
    banner_btn = page.query_selector('button:has-text("Mulai Tur")')
    if banner_btn and banner_btn.is_visible():
        banner_btn.click()
    else:
        page.click('button:has-text("Panduan")')
        page.wait_for_timeout(500)
        page.click('button:has-text("Buka Tur Visual")')

    page.wait_for_timeout(1000)

    # Step 1
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step1.png')
    print("Step 1 captured")

    # Step 2
    page.click('button:has-text("Selanjutnya")')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step2.png')
    print("Step 2 captured")

    # Step 3
    page.click('button:has-text("Selanjutnya")')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step3.png')
    print("Step 3 captured")

    # Step 4
    page.click('button:has-text("Selanjutnya")')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step4.png')
    print("Step 4 captured")

    # Step 5
    page.click('button:has-text("Selanjutnya")')
    page.wait_for_timeout(1000)
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/tour_step5.png')
    print("Step 5 captured")

    browser.close()
