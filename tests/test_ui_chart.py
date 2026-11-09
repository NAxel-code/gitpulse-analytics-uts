from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000', wait_until='networkidle')
    page.wait_for_timeout(2000)

    # Click on the chip for gitpulse-analytics
    chips = page.query_selector_all('header button, .flex button')
    target = None
    for c in chips:
        if 'gitpulse-analytics' in (c.text_content() or ''):
            target = c
            break

    if target:
        print('Found chip gitpulse-analytics, clicking...')
        target.click()
        page.wait_for_timeout(3000)

    # Count recharts areas
    areas = page.query_selector_all('path.recharts-area-area')
    print('Found recharts areas count:', len(areas))

    curves = page.query_selector_all('path.recharts-area-curve')
    print('Found recharts curves count:', len(curves))

    for idx, a in enumerate(areas):
        d = a.get_attribute('d')
        print(f'Area {idx} path len: {len(d) if d else 0}')

    # Click 'Issues & Stars' toggle
    btn_issues = page.query_selector('button:has-text("Issues & Stars")')
    if btn_issues:
        print('Clicking Issues & Stars toggle...')
        btn_issues.click()
        page.wait_for_timeout(1000)

    areas_issues = page.query_selector_all('path.recharts-area-area')
    print('Issues & Stars recharts areas count:', len(areas_issues))

    page.screenshot(path='c:/Users/User/.gemini/antigravity/brain/3b673e83-713f-4c91-9bc7-70ec7e50aba3/gitpulse_issues_chart_verified.png')
    print('Screenshot saved!')
    browser.close()
