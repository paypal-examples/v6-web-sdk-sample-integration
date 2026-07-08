import {
  LPM_REGISTRY,
  type LPMName,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";

/**
 * Per-LPM demo metadata that is NOT present in the SDK's `LPM_REGISTRY`:
 * the sandbox test `currency` and the `findEligibleMethods` eligibility key.
 *
 * Source of truth: the vanilla-JS reference table in
 * `client/components/localPaymentMethods/README.md`. Registry-only methods that
 * are absent from that table (satispay, grabpay, bancomatPay, crypto) use a
 * currency inferred from their `testBuyerCountry`.
 *
 * Note: eligibility keys differ from registry keys for several methods, e.g.
 * registry `estonia` -> eligibility `estonia_banks`, `floa` -> `floa_pay`,
 * `oxxopay` -> `oxxo_pay`. SEPA has no eligibility key (always presented).
 */
export interface LPMDemoMeta {
  /** ISO-4217 currency used for sandbox testing this method. */
  readonly currency: string;
  /** Key passed to `eligiblePaymentMethods.isEligible(...)`. */
  readonly eligibilityKey?: string;
}

export const LPM_DEMO_META: Record<LPMName, LPMDemoMeta> = {
  ideal: { currency: "EUR", eligibilityKey: "ideal" },
  bancontact: { currency: "EUR", eligibilityKey: "bancontact" },
  eps: { currency: "EUR", eligibilityKey: "eps" },
  blik: { currency: "PLN", eligibilityKey: "blik" },
  mybank: { currency: "EUR", eligibilityKey: "mybank" },
  trustly: { currency: "SEK", eligibilityKey: "trustly" },
  p24: { currency: "PLN", eligibilityKey: "p24" },
  multibanco: { currency: "EUR", eligibilityKey: "multibanco" },
  bizum: { currency: "EUR", eligibilityKey: "bizum" },
  swish: { currency: "SEK", eligibilityKey: "swish" },
  twint: { currency: "CHF", eligibilityKey: "twint" },
  wechatpay: { currency: "CNY", eligibilityKey: "wechatpay" },
  verkkopankki: { currency: "EUR", eligibilityKey: "verkkopankki" },
  payu: { currency: "PLN", eligibilityKey: "payu" },
  mbway: { currency: "EUR", eligibilityKey: "mbway" },
  satispay: { currency: "EUR", eligibilityKey: "satispay" },
  wero: { currency: "EUR", eligibilityKey: "wero" },
  floa: { currency: "EUR", eligibilityKey: "floa_pay" },
  grabpay: { currency: "SGD", eligibilityKey: "grabpay" },
  pixInternational: { currency: "BRL", eligibilityKey: "pix_international" },
  sepa: { currency: "EUR" },
  doku: { currency: "IDR", eligibilityKey: "doku" },
  estonia: { currency: "EUR", eligibilityKey: "estonia_banks" },
  gopay: { currency: "IDR", eligibilityKey: "gopay" },
  alipay: { currency: "USD", eligibilityKey: "alipay" },
  indonesiaBanks: { currency: "IDR", eligibilityKey: "indonesia_banks" },
  kredivo: { currency: "IDR", eligibilityKey: "kredivo" },
  linkaja: { currency: "IDR", eligibilityKey: "linkaja" },
  ovo: { currency: "IDR", eligibilityKey: "ovo" },
  paysera: { currency: "EUR", eligibilityKey: "paysera" },
  skrill: { currency: "EUR", eligibilityKey: "skrill" },
  blikPayLater: { currency: "PLN", eligibilityKey: "blik_pay_later" },
  bancomatPay: { currency: "EUR", eligibilityKey: "bancomat_pay" },
  jeniuspay: { currency: "IDR", eligibilityKey: "jenius_pay" },
  klarna: { currency: "GBP", eligibilityKey: "klarna" },
  afterpay: { currency: "AUD", eligibilityKey: "afterpay" },
  oxxopay: { currency: "MXN", eligibilityKey: "oxxo_pay" },
  boletobancario: { currency: "BRL", eligibilityKey: "boletobancario" },
  paysafecard: { currency: "EUR", eligibilityKey: "paysafecard" },
  scalapay: { currency: "EUR", eligibilityKey: "scalapay" },
  crypto: { currency: "USD", eligibilityKey: "crypto" },
  dragonpay: { currency: "PHP", eligibilityKey: "dragonpay" },
  fpx: { currency: "MYR", eligibilityKey: "fpx" },
  indomaret: { currency: "IDR", eligibilityKey: "indomaret" },
  thailandBanks: { currency: "THB", eligibilityKey: "thailand_banks" },
  alfamart: { currency: "IDR", eligibilityKey: "alfamart" },
  zip: { currency: "AUD", eligibilityKey: "zip" },
  latviaBanks: { currency: "EUR", eligibilityKey: "latvia_banks" },
  fiuu: { currency: "MYR", eligibilityKey: "fiuu_cash" },
  lithuaniaBanks: { currency: "EUR", eligibilityKey: "lithuania_banks" },
};

/** A fully-resolved view of one LPM for the demo UI. */
export interface LPMDemoEntry {
  readonly lpm: LPMName;
  readonly displayName: string;
  readonly component: string;
  readonly testBuyerCountry: string;
  readonly currency: string;
  readonly eligibilityKey?: string;
  readonly fields: readonly string[];
  readonly sessionFields: readonly string[];
}

/** All supported LPMs, merged from `LPM_REGISTRY` + `LPM_DEMO_META`, sorted by name. */
export const LPM_DEMO_ENTRIES: readonly LPMDemoEntry[] = (
  Object.keys(LPM_REGISTRY) as LPMName[]
)
  .map((lpm) => {
    const config = LPM_REGISTRY[lpm];
    const meta = LPM_DEMO_META[lpm];
    return {
      lpm,
      displayName: config.displayName,
      component: config.component,
      testBuyerCountry: config.testBuyerCountry,
      currency: meta.currency,
      eligibilityKey: meta.eligibilityKey,
      fields: config.fields,
      sessionFields: config.sessionFields,
    };
  })
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

/** Lookup a single resolved LPM demo entry by registry key. */
export function getLPMDemoEntry(lpm: string): LPMDemoEntry | undefined {
  return LPM_DEMO_ENTRIES.find((entry) => entry.lpm === lpm);
}
