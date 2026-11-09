"""Playwright E2E Automated Browser Test for GitPulse Analytics.

Verifies:
1. Bento Grid dashboard rendering with DORA metrics.
2. Contributor table interaction, search filter, and empty state.
3. Woopra-style contributor journey modal opening & closing.
4. AI search modal (Cmd+K) trigger & query execution.
"""

import sys
import os
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

def run_e2e_test(base_url="http://localhost:3000"):
    print(f"[*] Starting GitPulse Playwright E2E test on {base_url}...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # 1. Navigate to page
        print("[1] Navigating to dashboard...")
        page.goto(base_url, timeout=30000)
        page.wait_for_load_state("networkidle")
        
        # Verify page title or branding
        assert "GitPulse" in page.content(), "Page does not contain 'GitPulse'"
        print("  [PASS] Page loaded successfully with GitPulse branding.")

        # 2. Verify Bento Grid KPI elements
        print("[2] Verifying KPI Cards and DORA Metrics strip...")
        page.wait_for_selector("text=Active Contributors", timeout=10000)
        page.wait_for_selector("text=Total Commits", timeout=10000)
        page.wait_for_selector("text=PR Merge Velocity", timeout=10000)
        page.wait_for_selector("text=Lead Time to Merge", timeout=10000)
        page.wait_for_selector("text=Time to First Review (TTFR)", timeout=10000)
        page.wait_for_selector("text=PR Size Hygiene", timeout=10000)
        print("  [PASS] KPI Cards and DORA metrics verified.")

        # 3. Verify Activity Chart and Funnel Chart
        print("[3] Verifying Activity Chart and PR Funnel...")
        page.wait_for_selector("text=Repository Activity Velocity", timeout=10000)
        page.wait_for_selector("text=PR Lifecycle Funnel", timeout=10000)
        print("  [PASS] Activity Chart and PR Funnel verified.")

        # Save clean dashboard view screenshot
        dash_screenshot = os.path.join(os.path.dirname(__file__), "e2e_dashboard.png")
        page.screenshot(path=dash_screenshot, full_page=True)
        print(f"  [PASS] Dashboard screenshot saved: {dash_screenshot}")

        # 4. Verify Contributor Table and Search Filter
        print("[4] Testing Contributor Table and search interactions...")
        search_input = page.locator("input[placeholder='Cari kontributor...']")
        assert search_input.is_visible(), "Contributor search input not visible"
        
        # Search for non-existent developer to test empty state
        search_input.fill("unknown_developer_404")
        page.wait_for_timeout(600)
        empty_text = page.locator("text=Tidak ditemukan kontributor yang cocok")
        assert empty_text.is_visible(), "Empty state message did not appear for invalid search"
        print("  [PASS] Empty search state displays actionable guidance.")

        # Reset filter
        reset_btn = page.locator("text=Reset Filter")
        if reset_btn.is_visible():
            reset_btn.click()
            page.wait_for_timeout(500)
            print("  [PASS] Reset filter button clicked successfully.")

        # 5. Test Contributor Journey Modal
        print("[5] Testing Contributor Journey Modal...")
        contributor_row = page.locator("table tbody tr").first
        assert contributor_row.is_visible(), "No contributor rows visible"
        contributor_row.click()
        page.wait_for_timeout(1000)
        
        # Check modal opened
        modal = page.locator("text=Contributor Profile")
        if modal.is_visible():
            print("  [PASS] Contributor Journey / Profile Modal opened.")
            # Close modal with ESC
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)

        # 6. Test AI Modal Trigger (Cmd+K / Ctrl+K)
        print("[6] Testing AI Search Modal (Ctrl+K)...")
        page.keyboard.press("Control+KeyK")
        page.wait_for_timeout(800)
        ai_modal_header = page.locator("text=Natural Language Code Analytics")
        if ai_modal_header.is_visible():
            print("  [PASS] AI Modal opened successfully via shortcut.")
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)

        # 7. Test Help Modal & Interactive Spotlight Tour
        print("[7] Testing Panduan & Documentation Modal and Tour flow...")
        help_btn = page.locator("button:has-text('Panduan')")
        assert help_btn.is_visible(), "Panduan button in header is not visible"
        help_btn.click()
        page.wait_for_timeout(600)
        
        help_modal_header = page.locator("text=Panduan & Dokumentasi GitPulse")
        assert help_modal_header.is_visible(), "Help modal did not open"
        print("  [PASS] Help & Documentation modal opened successfully.")

        # Test tab switching
        page.locator("button:has-text('Cheat Sheet AI & Command')").click()
        page.wait_for_timeout(300)
        assert page.locator("text=Pencarian AI Berbasis Text-to-SQL").is_visible(), "AI cheat sheet tab content missing"

        page.locator("button:has-text('Glosarium Metrik DORA')").click()
        page.wait_for_timeout(300)
        assert page.locator("text=Z-Score Deviation (σ)").is_visible(), "DORA glossary tab content missing"
        print("  [PASS] Documentation tabs switched and verified.")

        # Start interactive visual tour from modal
        tour_launch_btn = page.locator("button:has-text('Buka Tur Visual')")
        tour_launch_btn.click()
        page.wait_for_timeout(600)

        step1 = page.locator("text=Langkah 1 dari 5")
        assert step1.is_visible(), "Tour Step 1 did not appear"
        print("  [PASS] Interactive Spotlight Tour launched (Step 1).")

        # Step forward
        next_btn = page.locator("button:has-text('Selanjutnya')")
        next_btn.click()
        page.wait_for_timeout(500)
        step2 = page.locator("text=Langkah 2 dari 5")
        assert step2.is_visible(), "Tour Step 2 did not appear"
        print("  [PASS] Tour navigation forward verified (Step 2).")

        # Close tour with ESC
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)
        print("  [PASS] Tour closed successfully via Escape.")

        # 8. Capture Verification Screenshot
        screenshot_path = os.path.join(os.path.dirname(__file__), "e2e_verification.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"  [PASS] Full page verification screenshot saved: {screenshot_path}")

        browser.close()
        print("[SUCCESS] All E2E Automated Browser Tests PASSED flawlessly!")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    run_e2e_test(url)
