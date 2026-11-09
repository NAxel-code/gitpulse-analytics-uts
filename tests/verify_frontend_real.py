from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000', timeout=60000)
    page.wait_for_timeout(3000)

    # 1. vercel/next.js screenshot
    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/vercel_real_dashboard.png', full_page=True)
    print('Saved vercel_real_dashboard.png')

    # 2. Click 'gitpulse-analytics'
    chip = page.query_selector('button:has-text("gitpulse-analytics")')
    if chip:
        print('Clicking gitpulse-analytics...')
        chip.click()
        # Wait for syncing indicator to disappear and real data to load
        page.wait_for_selector('button:has-text("Syncing...")', timeout=5000)
        print('Sync started, waiting for completion...')
        page.wait_for_selector('button:has-text("Sync Live Repo")', timeout=25000)
        print('Sync complete! Waiting for UI update...')
        page.wait_for_timeout(2000)
        page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/naxel_real_dashboard.png', full_page=True)
        print('Saved naxel_real_dashboard.png')

    browser.close()
