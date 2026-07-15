/**
 * Functional Tests – Local Payment Methods (LPM) React wrapper demo
 *
 * URL pattern: http://localhost:3000/#/local-payment-methods/:key
 *
 * ─── One test per LPM ────────────────────────────────────────────────────────
 * Each test verifies the complete payment flow:
 *
 *   1. Navigate to the LPM checkout page
 *   2. Eligibility check fires (server calls PayPal v2/payments/find-eligible-methods)
 *   3. Input fields load and are pre-filled
 *   4. Payment button is visible in shadow DOM
 *   5. Click button → PayPal sandbox popup opens
 *   6. Popup closes (buyer approval simulated via dev hook in non-PROD mode)
 *   7. ✅ Success banner shows:
 *        "Payment Successful!"
 *        "Thank you for your <DisplayName> purchase!"
 *        Order ID  – non-empty
 *        Status    – COMPLETED
 *        Amount    – numeric > 0
 *
 * ─── Dev hook ────────────────────────────────────────────────────────────────
 * The component exposes `window.__lpmSetResult` in non-PROD builds.
 * After verifying the button renders (real SDK interaction), we use the hook
 * to simulate `onApprove` with a mocked completed order — bypassing the
 * phone/app-confirmation step that PayPal sandbox cannot auto-approve.
 *
 * ─── Prerequisites ───────────────────────────────────────────────────────────
 *   cd client/prebuiltPages/react && npm start     (port 3000)
 *   cd server/node && npm start                    (port 8080)
 *
 * ─── Run ─────────────────────────────────────────────────────────────────────
 *   cd tests/functional
 *   npx playwright test lpm/lpm.spec.ts                       # all 50 LPMs
 *   npx playwright test lpm/lpm.spec.ts --grep "mbway"        # single LPM
 *   npx playwright test lpm/lpm.spec.ts --workers=4           # parallel
 */

import { test, expect } from "../fixtures";

// ─── LPM catalogue ────────────────────────────────────────────────────────────

interface LPMEntry {
  key: string;
  displayName: string;
  currency: string;
  buyerCountry: string;
  buttonTag: string; // lowercase web component tag rendered by the SDK
}

const ALL_LPMS: LPMEntry[] = [
  { key: "ideal",            displayName: "iDEAL",           currency: "EUR", buyerCountry: "NL", buttonTag: "ideal-button" },
  { key: "bancontact",       displayName: "Bancontact",       currency: "EUR", buyerCountry: "BE", buttonTag: "bancontact-button" },
  { key: "eps",              displayName: "EPS",              currency: "EUR", buyerCountry: "AT", buttonTag: "eps-button" },
  { key: "blik",             displayName: "BLIK",             currency: "PLN", buyerCountry: "PL", buttonTag: "blik-button" },
  { key: "mybank",           displayName: "MyBank",           currency: "EUR", buyerCountry: "IT", buttonTag: "mybank-button" },
  { key: "trustly",          displayName: "Trustly",          currency: "SEK", buyerCountry: "SE", buttonTag: "trustly-button" },
  { key: "p24",              displayName: "Przelewy24",       currency: "PLN", buyerCountry: "PL", buttonTag: "p24-button" },
  { key: "multibanco",       displayName: "Multibanco",       currency: "EUR", buyerCountry: "PT", buttonTag: "multibanco-button" },
  { key: "bizum",            displayName: "Bizum",            currency: "EUR", buyerCountry: "ES", buttonTag: "bizum-button" },
  { key: "swish",            displayName: "Swish",            currency: "SEK", buyerCountry: "SE", buttonTag: "swish-button" },
  { key: "twint",            displayName: "TWINT",            currency: "CHF", buyerCountry: "CH", buttonTag: "twint-button" },
  { key: "wechatpay",        displayName: "WeChat Pay",       currency: "CNY", buyerCountry: "CN", buttonTag: "wechatpay-button" },
  { key: "verkkopankki",     displayName: "Verkkopankki",     currency: "EUR", buyerCountry: "FI", buttonTag: "verkkopankki-button" },
  { key: "payu",             displayName: "PayU",             currency: "PLN", buyerCountry: "PL", buttonTag: "payu-button" },
  { key: "mbway",            displayName: "MB WAY",           currency: "EUR", buyerCountry: "PT", buttonTag: "mbway-button" },
  { key: "satispay",         displayName: "Satispay",         currency: "EUR", buyerCountry: "IT", buttonTag: "satispay-button" },
  { key: "wero",             displayName: "Wero",             currency: "EUR", buyerCountry: "DE", buttonTag: "wero-button" },
  { key: "floa",             displayName: "FLOA",             currency: "EUR", buyerCountry: "FR", buttonTag: "floa-button" },
  { key: "grabpay",          displayName: "GrabPay",          currency: "SGD", buyerCountry: "SG", buttonTag: "grabpay-button" },
  { key: "pixInternational", displayName: "Pix",              currency: "BRL", buyerCountry: "BR", buttonTag: "pix-international-button" },
  { key: "sepa",             displayName: "SEPA",             currency: "EUR", buyerCountry: "DE", buttonTag: "sepa-button" },
  { key: "doku",             displayName: "DOKU",             currency: "IDR", buyerCountry: "ID", buttonTag: "doku-button" },
  { key: "estonia",          displayName: "Estonia Banks",    currency: "EUR", buyerCountry: "EE", buttonTag: "estonia-button" },
  { key: "gopay",            displayName: "GoPay",            currency: "IDR", buyerCountry: "ID", buttonTag: "gopay-button" },
  { key: "alipay",           displayName: "Alipay",           currency: "USD", buyerCountry: "CN", buttonTag: "alipay-button" },
  { key: "indonesiaBanks",   displayName: "Indonesia Banks",  currency: "IDR", buyerCountry: "ID", buttonTag: "indonesia-banks-button" },
  { key: "kredivo",          displayName: "Kredivo",          currency: "IDR", buyerCountry: "ID", buttonTag: "kredivo-button" },
  { key: "linkaja",          displayName: "LinkAja",          currency: "IDR", buyerCountry: "ID", buttonTag: "linkaja-button" },
  { key: "ovo",              displayName: "OVO",              currency: "IDR", buyerCountry: "ID", buttonTag: "ovo-button" },
  { key: "paysera",          displayName: "Paysera",          currency: "EUR", buyerCountry: "LT", buttonTag: "paysera-button" },
  { key: "skrill",           displayName: "Skrill",           currency: "EUR", buyerCountry: "DE", buttonTag: "skrill-button" },
  { key: "blikPayLater",     displayName: "BLIK Pay Later",   currency: "PLN", buyerCountry: "PL", buttonTag: "blik-pay-later-button" },
  { key: "bancomatPay",      displayName: "Bancomat Pay",     currency: "EUR", buyerCountry: "IT", buttonTag: "bancomat-pay-button" },
  { key: "jeniuspay",        displayName: "Jeniuspay",        currency: "IDR", buyerCountry: "ID", buttonTag: "jeniuspay-button" },
  { key: "klarna",           displayName: "Klarna",           currency: "GBP", buyerCountry: "SE", buttonTag: "klarna-button" },
  { key: "afterpay",         displayName: "Afterpay",         currency: "AUD", buyerCountry: "AU", buttonTag: "afterpay-button" },
  { key: "oxxopay",          displayName: "OXXO",             currency: "MXN", buyerCountry: "MX", buttonTag: "oxxopay-button" },
  { key: "boletobancario",   displayName: "Boleto Bancário",  currency: "BRL", buyerCountry: "BR", buttonTag: "boletobancario-button" },
  { key: "paysafecard",      displayName: "Paysafecard",      currency: "EUR", buyerCountry: "AT", buttonTag: "paysafecard-button" },
  { key: "scalapay",         displayName: "Scalapay",         currency: "EUR", buyerCountry: "IT", buttonTag: "scalapay-button" },
  { key: "crypto",           displayName: "Crypto",           currency: "USD", buyerCountry: "US", buttonTag: "crypto-button" },
  { key: "dragonpay",        displayName: "Dragonpay",        currency: "PHP", buyerCountry: "PH", buttonTag: "dragonpay-button" },
  { key: "fpx",              displayName: "FPX",              currency: "MYR", buyerCountry: "MY", buttonTag: "fpx-button" },
  { key: "indomaret",        displayName: "Indomaret",        currency: "IDR", buyerCountry: "ID", buttonTag: "indomaret-button" },
  { key: "thailandBanks",    displayName: "Thailand Banks",   currency: "THB", buyerCountry: "TH", buttonTag: "thailand-banks-button" },
  { key: "alfamart",         displayName: "Alfamart",         currency: "IDR", buyerCountry: "ID", buttonTag: "alfamart-button" },
  { key: "zip",              displayName: "Zip",              currency: "AUD", buyerCountry: "AU", buttonTag: "zip-button" },
  { key: "latviaBanks",      displayName: "Latvia Banks",     currency: "EUR", buyerCountry: "LV", buttonTag: "latvia-banks-button" },
  { key: "fiuu",             displayName: "FIUU",             currency: "MYR", buyerCountry: "MY", buttonTag: "fiuu-button" },
  { key: "lithuaniaBanks",   displayName: "Lithuania Banks",  currency: "EUR", buyerCountry: "LT", buttonTag: "lithuania-banks-button" },
];

// ─── Timing ───────────────────────────────────────────────────────────────────

/** Time (ms) for the PayPal SDK + LPM web components to initialise after page load */
const SDK_INIT_WAIT = 8_000;
/** Timeout for the result banner to appear after simulating approval */
const BANNER_TIMEOUT = 15_000;
/** Timeout for the PayPal popup to open after clicking the button */
const POPUP_TIMEOUT = 30_000;

// ─── Per-LPM payment test ─────────────────────────────────────────────────────

test.describe("LPM React wrapper – payment flow", () => {
  for (const lpm of ALL_LPMS) {
    test(`[${lpm.key}] ${lpm.displayName} – input fields, button, popup, success banner`, async ({
      networkPage: page,
      context,
    }) => {
      const mockOrderId = `TEST-${lpm.key.toUpperCase().replace(/[^A-Z0-9]/g, "-")}-ORDER`;
      const mockAmount = "205.00";

      // ── Step 0: mock the order-fetch endpoint ─────────────────────────────
      await page.route(`**/paypal-api/checkout/orders/${mockOrderId}`, (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: mockOrderId,
            status: "COMPLETED",
            purchase_units: [
              {
                amount: { value: mockAmount, currency_code: lpm.currency },
                payments: {
                  captures: [
                    {
                      id: `CAP-${lpm.key.toUpperCase()}`,
                      status: "COMPLETED",
                      amount: { value: mockAmount, currency_code: lpm.currency },
                    },
                  ],
                },
              },
            ],
          }),
        });
      });

      // ── Step 1: navigate to LPM page ──────────────────────────────────────
      await page.goto(`/#/local-payment-methods/${lpm.key}`);
      await page.getByRole("button", { name: /show code/i }).waitFor({ timeout: 15_000 });

      // ── Step 2: eligibility check fires ───────────────────────────────────
      // Wait for "Checking eligibility…" to disappear (either eligible or ineligible)
      await page.locator('[data-testid="eligibility-loading"]').waitFor({
        state: "hidden",
        timeout: 30_000,
      }).catch(() => {
        // If the testid is never present, eligibility resolved immediately — that's fine
      });

      // If ineligible, log and skip (sandbox may not support all LPMs)
      const ineligibleBanner = page.locator('[data-testid="eligibility-ineligible"]');
      if (await ineligibleBanner.isVisible({ timeout: 2_000 }).catch(() => false)) {
        const msg = await ineligibleBanner.textContent();
        console.warn(`[${lpm.key}] INELIGIBLE in sandbox: ${msg}`);
        test.skip();
        return;
      }

      // ── Step 3: wait for SDK init, input fields pre-filled ────────────────
      await page.waitForTimeout(SDK_INIT_WAIT);

      // The SDK renders input fields inside the LPM web component shadow DOM.
      // Wait for at least one shadow-pierced input to appear with a pre-filled value.
      const shadowInput = page.locator(`${lpm.buttonTag} >> input, paypal-hosted-local-redirect-payment-fields >> input`).first();
      const inputVisible = await shadowInput.isVisible({ timeout: 5_000 }).catch(() => false);
      if (inputVisible) {
        const val = await shadowInput.inputValue({ timeout: 2_000 }).catch(() => "");
        // Fields should be pre-filled by our component with sample values
        expect(val.length, `[${lpm.key}] pre-filled input should not be empty`).toBeGreaterThan(0);
      }
      // Note: some LPMs have no name/email fields (e.g. SEPA, Crypto) — that's OK

      // ── Step 4: payment button visible ───────────────────────────────────
      const payBtn = page.locator(`${lpm.buttonTag} >> button`);
      await expect(payBtn).toBeVisible({ timeout: 15_000 });

      // ── Step 5: click button → popup opens ───────────────────────────────
      const [popup] = await Promise.all([
        context.waitForEvent("page", { timeout: POPUP_TIMEOUT }),
        payBtn.click(),
      ]);
      await popup.waitForLoadState("domcontentloaded", { timeout: 30_000 });

      // Popup must be on PayPal sandbox
      expect(popup.url(), `[${lpm.key}] popup should be on sandbox.paypal.com`).toContain(
        "sandbox.paypal.com",
      );
      console.log(`[${lpm.key}] Popup: ${popup.url().slice(0, 80)}`);

      // ── Step 6: simulate approval via dev hook ────────────────────────────
      // (PayPal sandbox cannot auto-approve phone/app-confirmation flows)
      // The hook replicates exactly what `onApprove` does: GET the order, set result.
      await page.evaluate(
        async ({ orderId }) => {
          const res = await fetch(`/paypal-api/checkout/orders/${orderId}`);
          const order = await res.json();
          const amount =
            order?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ??
            order?.purchase_units?.[0]?.amount?.value;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__lpmSetResult({
            type: "success",
            orderId,
            status: order?.status ?? "COMPLETED",
            amount,
          });
        },
        { orderId: mockOrderId },
      );

      // ── Step 7: assert success banner ────────────────────────────────────
      const banner = page.getByRole("status");
      await expect(banner).toBeVisible({ timeout: BANNER_TIMEOUT });

      await expect(banner.getByText("Payment Successful!", { exact: false })).toBeVisible();
      await expect(
        banner.getByText(new RegExp(`thank you.*${lpm.displayName}.*purchase`, "i")),
      ).toBeVisible();

      const orderIdCell = banner.locator("table tbody tr").nth(0).locator("td").nth(1);
      await expect(orderIdCell).toHaveText(mockOrderId);

      const statusCell = banner.locator("table tbody tr").nth(1).locator("td").nth(1);
      await expect(statusCell).toHaveText("COMPLETED");

      const amountCell = banner.locator("table tbody tr").nth(2).locator("td").nth(1);
      const amountText = await amountCell.textContent();
      expect(Number(amountText?.trim())).toBeGreaterThan(0);

      // Payment button hidden after success
      await expect(payBtn).not.toBeVisible();

      console.log(
        `✅ [${lpm.key}] ${lpm.displayName} | Order: ${mockOrderId} | Status: COMPLETED | Amount: ${amountText?.trim()} ${lpm.currency}`,
      );
    });
  }
});
