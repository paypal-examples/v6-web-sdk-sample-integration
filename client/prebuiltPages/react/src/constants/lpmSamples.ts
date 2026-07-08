import type { LPMDemoEntry } from "../constants/lpm";

/**
 * Sample session-field values for LPMs that require merchant-supplied data at
 * `session.start()` time (phone, billing address, tax info, etc.). These are
 * demo/sandbox placeholders — a real integration would collect them from the
 * buyer. Shapes match `LPMSessionFields` from `@paypal/paypal-js/sdk-v6`.
 */

type Phone = { countryCode: string; nationalNumber: string };
type BillingAddress = {
  addressLine1: string;
  addressLine2?: string;
  adminArea1: string;
  adminArea2?: string;
  postalCode: string;
  countryCode: string;
};
type TaxInfo = { taxId: string; taxIdType: string };

export interface LPMSessionExtras {
  phone?: Phone;
  billingAddress?: BillingAddress;
  taxInfo?: TaxInfo;
  dateOfBirth?: string;
  numberOfInstallments?: number;
}

// Reasonable per-country sample phone numbers, falling back to a generic value.
const SAMPLE_PHONE_BY_COUNTRY: Record<string, Phone> = {
  ID: { countryCode: "62", nationalNumber: "81234567890" },
  BR: { countryCode: "55", nationalNumber: "11987654321" },
  PT: { countryCode: "351", nationalNumber: "912345678" },
  IT: { countryCode: "39", nationalNumber: "3123456789" },
};

// Per-country sample tax id + type for LPMs requiring tax info.
const SAMPLE_TAX_BY_COUNTRY: Record<string, TaxInfo> = {
  BR: { taxId: "12345678909", taxIdType: "BR_CPF" },
  IT: { taxId: "RSSMRA80A01H501U", taxIdType: "IT_CF" },
  ID: { taxId: "1234567890123456", taxIdType: "ID_NIK" },
};

function sampleBillingAddress(countryCode: string): BillingAddress {
  return {
    addressLine1: "123 Main St",
    adminArea2: "Sample City",
    adminArea1: "Sample State",
    postalCode: "12345",
    countryCode,
  };
}

/**
 * Builds the sample session-field extras for a given LPM based on its
 * `sessionFields` requirements. Returns an empty object for LPMs that need none.
 */
export function buildSampleSessionExtras(
  entry: LPMDemoEntry,
): LPMSessionExtras {
  const extras: LPMSessionExtras = {};
  const country = entry.testBuyerCountry;

  for (const field of entry.sessionFields) {
    switch (field) {
      case "phone":
        extras.phone = SAMPLE_PHONE_BY_COUNTRY[country] ?? {
          countryCode: "1",
          nationalNumber: "5551234567",
        };
        break;
      case "billingAddress":
        extras.billingAddress = sampleBillingAddress(country);
        break;
      case "taxInfo":
        extras.taxInfo = SAMPLE_TAX_BY_COUNTRY[country] ?? {
          taxId: "12345678909",
          taxIdType: "BR_CPF",
        };
        break;
      case "dateOfBirth":
        extras.dateOfBirth = "1990-01-01";
        break;
      case "numberOfInstallments":
        extras.numberOfInstallments = 3;
        break;
    }
  }

  return extras;
}

/**
 * Sample prefill values for the internally-rendered payment fields
 * (e.g. Full Name, Email), passed to the button's `fieldValues` prop.
 */
export const SAMPLE_FIELD_VALUES: Record<string, string> = {
  name: "John Doe",
  email: "buyer@example.com",
};
