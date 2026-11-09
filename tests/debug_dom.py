from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000')
    page.wait_for_timeout(3000)

    has_btn = page.evaluate("() => document.getElementById('btn-ganti-repo') !== null")
    print('has #btn-ganti-repo:', has_btn)

    btn = page.query_selector('#btn-ganti-repo')
    if btn:
        print('Clicking btn...')
        btn.click()
        page.wait_for_timeout(1000)
        has_modal = page.evaluate("() => document.getElementById('input-custom-repo') !== null")
        print('has #input-custom-repo:', has_modal)
        page.screenshot(path='C:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/debug_dom_after_click.png')

    browser.close()
