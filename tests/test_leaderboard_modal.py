from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000', timeout=60000)
    page.wait_for_timeout(3000)

    # 1. Click Leaderboard button in Header
    print("Finding and clicking Leaderboard button...")
    leaderboard_btn = page.query_selector('button:has-text("Leaderboard")')
    assert leaderboard_btn, "Leaderboard button not found in Header"
    leaderboard_btn.click()
    page.wait_for_timeout(1000)

    # 2. Capture Open Source Benchmark Leaderboard Modal (All categories)
    page.screenshot(
        path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/leaderboard_modal_all.png'
    )
    print("Saved leaderboard_modal_all.png")

    # 3. Click AI & Machine Learning Tab
    print("Clicking AI & Machine Learning tab...")
    ai_tab = page.query_selector('button:has-text("AI & Machine Learning")')
    if ai_tab:
        ai_tab.click()
        page.wait_for_timeout(1000)
        page.screenshot(
            path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/leaderboard_modal_ai.png'
        )
        print("Saved leaderboard_modal_ai.png")

    # 4. Filter by Apache license
    select = page.query_selector('select[aria-label="Filter Lisensi"]')
    if select:
        print("Filtering by Apache-2.0...")
        select.select_option('apache')
        page.wait_for_timeout(1000)
        page.screenshot(
            path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/leaderboard_modal_apache.png'
        )
        print("Saved leaderboard_modal_apache.png")

    # 5. Reset filter & Click 'Analisis Repo' for vllm-project/vllm
    if select:
        select.select_option('all')
        page.wait_for_timeout(500)

    vllm_row = page.query_selector('div:has-text("vllm-project/vllm") button:has-text("Analisis Repo")')
    if vllm_row:
        print("Clicking 'Analisis Repo' for vllm-project/vllm...")
        vllm_row.click()
        # Wait for sync to start and finish
        try:
            page.wait_for_selector('button:has-text("Syncing...")', timeout=5000)
            print("Sync started, waiting for completion...")
            page.wait_for_selector('button:has-text("Sync Live Repo")', timeout=30000)
            print("Sync complete!")
        except Exception as e:
            print(f"Wait note: {e}")
        
        page.wait_for_timeout(2000)
        page.screenshot(
            path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/vllm_analyzed_dashboard.png',
            full_page=True
        )
        print("Saved vllm_analyzed_dashboard.png")

    browser.close()
    print("Leaderboard test complete!")
