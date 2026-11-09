from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    print("Navigating to http://localhost:3000...")
    page.goto('http://localhost:3000', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # 1. Open 'Ganti Repo' Modal
    print("Clicking #btn-ganti-repo...")
    page.wait_for_selector('#btn-ganti-repo', timeout=15000)
    page.click('#btn-ganti-repo')
    page.wait_for_selector('#input-custom-repo', timeout=10000)
    page.wait_for_timeout(500)

    # Screenshot the upgraded Universal modal
    page.screenshot(
        path='C:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/universal_repo_modal.png'
    )
    print("Saved universal_repo_modal.png")

    # 2. Test Live Autocomplete: Type 'vllm'
    input_box = page.locator('#input-custom-repo')
    input_box.fill('vllm')
    print("Waiting for #autocomplete-dropdown to appear...")
    page.wait_for_selector('#autocomplete-dropdown', timeout=15000)
    page.wait_for_timeout(1000)

    # Screenshot live autocomplete dropdown
    page.screenshot(
        path='C:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/autocomplete_dropdown.png'
    )
    print("Saved autocomplete_dropdown.png")

    # 3. Select 'vllm-project/vllm' from autocomplete dropdown
    vllm_item = page.locator('#autocomplete-dropdown button:has-text("vllm-project/vllm")').first
    print("Clicking vllm-project/vllm from autocomplete...")
    vllm_item.click()
    page.wait_for_timeout(500)

    # 4. Click Submit
    submit_btn = page.locator('button:has-text("Muat & Analisis Repositori")')
    print("Submitting repository...")
    submit_btn.click()

    # 5. Wait for target to switch and sync
    page.wait_for_selector('button:has-text("vllm-project/vllm")', timeout=15000)
    page.wait_for_timeout(6000)

    # 6. Screenshot the loaded dashboard
    page.screenshot(
        path='C:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/vllm_dashboard_verified.png',
        full_page=True
    )
    print("Saved vllm_dashboard_verified.png")

    browser.close()
    print("Universal repository live search & switch test completed successfully!")
