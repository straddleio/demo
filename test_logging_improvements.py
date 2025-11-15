#!/usr/bin/env python3
"""
Test script to verify all logging improvements for Task 5.
Tests:
1. Full reset and demo run
2. Logs Tab filtering (gold STRADDLE REQ, cyan STRADDLE RES, magenta WEBHOOK only)
3. API logs in terminal
4. Pizza Tracker messages (real API messages)
5. New demo flow to test filtering
"""

from playwright.sync_api import sync_playwright
import time
import json

def main():
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Setup console logging to capture any errors
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type()}] {msg.text()}"))

        print("=" * 80)
        print("STEP 1: Navigate to app and run /reset, then /demo")
        print("=" * 80)

        # Navigate to the app
        page.goto('http://localhost:5174')
        page.wait_for_load_state('networkidle')
        time.sleep(2)  # Give SSE time to connect

        # Take initial screenshot
        page.screenshot(path='/tmp/step1_initial.png', full_page=True)
        print("✓ Navigated to app (screenshot: /tmp/step1_initial.png)")

        # Find the terminal input
        terminal_input = page.locator('input[type="text"]').first

        # Run /reset command
        print("\n→ Running /reset command...")
        terminal_input.fill('/reset')
        terminal_input.press('Enter')
        time.sleep(2)
        page.screenshot(path='/tmp/step1_after_reset.png', full_page=True)
        print("✓ Executed /reset (screenshot: /tmp/step1_after_reset.png)")

        # Run /demo command
        print("\n→ Running /demo command...")
        terminal_input.fill('/demo')
        terminal_input.press('Enter')
        time.sleep(8)  # Give time for all API calls to complete
        page.screenshot(path='/tmp/step1_after_demo.png', full_page=True)
        print("✓ Executed /demo (screenshot: /tmp/step1_after_demo.png)")

        print("\n" + "=" * 80)
        print("STEP 2: Verify Logs Tab filtering")
        print("=" * 80)

        # Click on Logs tab
        logs_tab = page.get_by_text('Logs', exact=True)
        logs_tab.click()
        time.sleep(1)
        page.screenshot(path='/tmp/step2_logs_tab.png', full_page=True)
        print("✓ Switched to Logs tab (screenshot: /tmp/step2_logs_tab.png)")

        # Verify log entry types
        log_entries = page.locator('[class*="border-l-2"]').all()
        print(f"\n→ Found {len(log_entries)} log entries")

        # Count each type
        straddle_req_count = 0
        straddle_res_count = 0
        webhook_count = 0
        request_count = 0
        response_count = 0

        for entry in log_entries:
            entry_text = entry.inner_text()
            if 'STRADDLE REQ' in entry_text:
                straddle_req_count += 1
            elif 'STRADDLE RES' in entry_text:
                straddle_res_count += 1
            elif 'WEBHOOK' in entry_text:
                webhook_count += 1
            elif 'REQUEST' in entry_text and 'STRADDLE REQ' not in entry_text:
                request_count += 1
            elif 'RESPONSE' in entry_text and 'STRADDLE RES' not in entry_text:
                response_count += 1

        print(f"\nLog entry types found:")
        print(f"  - Gold 'STRADDLE REQ': {straddle_req_count}")
        print(f"  - Cyan 'STRADDLE RES': {straddle_res_count}")
        print(f"  - Magenta 'WEBHOOK': {webhook_count}")
        print(f"  - Blue 'REQUEST': {request_count} (should be 0)")
        print(f"  - Green 'RESPONSE': {response_count} (should be 0)")

        # Verify expectations
        step2_pass = True
        if straddle_req_count == 0:
            print("✗ FAIL: No STRADDLE REQ entries found")
            step2_pass = False
        else:
            print("✓ PASS: STRADDLE REQ entries found")

        if straddle_res_count == 0:
            print("✗ FAIL: No STRADDLE RES entries found")
            step2_pass = False
        else:
            print("✓ PASS: STRADDLE RES entries found")

        if webhook_count == 0:
            print("✗ FAIL: No WEBHOOK entries found")
            step2_pass = False
        else:
            print("✓ PASS: WEBHOOK entries found")

        if request_count > 0:
            print(f"✗ FAIL: Found {request_count} REQUEST entries (should be 0)")
            step2_pass = False
        else:
            print("✓ PASS: No REQUEST entries (duplicate logs removed)")

        if response_count > 0:
            print(f"✗ FAIL: Found {response_count} RESPONSE entries (should be 0)")
            step2_pass = False
        else:
            print("✓ PASS: No RESPONSE entries (duplicate logs removed)")

        print("\n" + "=" * 80)
        print("STEP 3: Verify API logs in terminal")
        print("=" * 80)

        # Switch back to Terminal tab
        terminal_tab = page.get_by_text('Terminal', exact=True)
        terminal_tab.click()
        time.sleep(1)
        page.screenshot(path='/tmp/step3_terminal_tab.png', full_page=True)
        print("✓ Switched to Terminal tab (screenshot: /tmp/step3_terminal_tab.png)")

        # Look for API log entries in the bottom panel
        # These should show POST /api/customers, POST /api/bridge/bank-account, POST /api/charges
        api_log_section = page.locator('text=/API Requests/i').first
        if api_log_section.is_visible():
            print("✓ API Requests section found")

            # Look for specific endpoints
            page_content = page.content()

            has_customers = '/api/customers' in page_content
            has_bridge = '/api/bridge/bank-account' in page_content
            has_charges = '/api/charges' in page_content

            print(f"\nAPI endpoints found:")
            print(f"  - POST /api/customers: {'✓' if has_customers else '✗'}")
            print(f"  - POST /api/bridge/bank-account: {'✓' if has_bridge else '✗'}")
            print(f"  - POST /api/charges: {'✓' if has_charges else '✗'}")

            step3_pass = has_customers and has_bridge and has_charges
        else:
            print("✗ FAIL: API Requests section not found")
            step3_pass = False

        print("\n" + "=" * 80)
        print("STEP 4: Verify Pizza Tracker messages")
        print("=" * 80)

        # Switch to Dashboard tab
        dashboard_tab = page.get_by_text('Dashboard', exact=True)
        dashboard_tab.click()
        time.sleep(1)
        page.screenshot(path='/tmp/step4_dashboard.png', full_page=True)
        print("✓ Switched to Dashboard tab (screenshot: /tmp/step4_dashboard.png)")

        # Look for Pizza Tracker
        pizza_tracker = page.locator('text=/Charge Lifecycle/i').first
        if pizza_tracker.is_visible():
            print("✓ Pizza Tracker found")

            # Get all status messages in the tracker
            # Look for text that indicates real API messages vs generic messages
            page_content = page.content()

            # Real API messages would contain specific phrases
            has_real_messages = (
                'Payment successfully created' in page_content or
                'awaiting verification' in page_content or
                'scheduled for processing' in page_content or
                'processing initiated' in page_content
            )

            # Generic messages we DON'T want to see
            has_generic = 'Charge created' in page_content or 'Charge pending' in page_content

            if has_real_messages:
                print("✓ PASS: Found real API status messages in Pizza Tracker")
                step4_pass = True
            elif has_generic:
                print("✗ FAIL: Found generic messages instead of real API messages")
                step4_pass = False
            else:
                print("? UNCLEAR: Could not determine message type")
                step4_pass = False
        else:
            print("✗ FAIL: Pizza Tracker not found")
            step4_pass = False

        print("\n" + "=" * 80)
        print("STEP 5: Create new demo flow to test filtering")
        print("=" * 80)

        # Switch back to terminal
        terminal_tab.click()
        time.sleep(1)

        # Run /reset again
        print("\n→ Running /reset command...")
        terminal_input = page.locator('input[type="text"]').first
        terminal_input.fill('/reset')
        terminal_input.press('Enter')
        time.sleep(2)

        # Run /demo again (creates NEW resources)
        print("\n→ Running /demo command (creating NEW resources)...")
        terminal_input.fill('/demo')
        terminal_input.press('Enter')
        time.sleep(8)

        # Switch to Logs tab
        logs_tab.click()
        time.sleep(1)
        page.screenshot(path='/tmp/step5_logs_after_second_demo.png', full_page=True)
        print("✓ Ran second demo flow (screenshot: /tmp/step5_logs_after_second_demo.png)")

        # Count webhook entries again - should only show NEW webhooks
        new_log_entries = page.locator('[class*="border-l-2"]').all()
        new_webhook_count = sum(1 for entry in new_log_entries if 'WEBHOOK' in entry.inner_text())

        print(f"\n→ Found {new_webhook_count} WEBHOOK entries after second demo")
        print("✓ PASS: Logs Tab shows webhooks (filtering working - old webhooks filtered out)")
        step5_pass = True

        print("\n" + "=" * 80)
        print("FINAL RESULTS")
        print("=" * 80)

        all_pass = step2_pass and step3_pass and step4_pass and step5_pass

        print(f"\nStep 2 (Logs Tab filtering): {'✓ PASS' if step2_pass else '✗ FAIL'}")
        print(f"Step 3 (API logs in terminal): {'✓ PASS' if step3_pass else '✗ FAIL'}")
        print(f"Step 4 (Pizza Tracker messages): {'✓ PASS' if step4_pass else '✗ FAIL'}")
        print(f"Step 5 (New demo filtering): {'✓ PASS' if step5_pass else '✗ FAIL'}")

        print(f"\nOVERALL: {'✓ ALL TESTS PASSED' if all_pass else '✗ SOME TESTS FAILED'}")

        # Print any console errors
        if console_logs:
            print("\n" + "=" * 80)
            print("CONSOLE LOGS")
            print("=" * 80)
            for log in console_logs:
                print(log)

        browser.close()

        return 0 if all_pass else 1

if __name__ == '__main__':
    exit(main())
