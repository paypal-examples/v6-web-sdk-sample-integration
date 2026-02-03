import { BASE_URL, CustomApiError, getFullScopeAccessToken } from "./utils";

type FindEligibleMethodsOptions = {
  customer?: {
    // two-letter country code for the customer's location
    country_code?: string;
  };
  purchase_units?: ReadonlyArray<{
    amount: {
      currency_code: string;
      value?: string;
    };
    payee?: {
      client_id?: string;
      merchant_id?: string;
    };
  }>;
  preferences?: {
    payment_flow?:
      | "ONE_TIME_PAYMENT"
      | "RECURRING_PAYMENT"
      | "VAULT_WITHOUT_PAYMENT"
      | "VAULT_WITH_PAYMENT";
    payment_source_constraint?: {
      constraint_type: "INCLUDE";
      payment_sources: (
        | "ADVANCED_CARDS"
        | "APPLE_PAY"
        | "GOOGLE_PAY"
        | "PAYPAL"
        | "VENMO"
      )[];
    };
  };
};

// the presence of a payment_source in the response
// indicates that it is eligible
type FindEligibleMethodsSuccessResponse = {
  eligible_methods: {
    [payment_source: string]: {
      can_be_vaulted?: true;
    };
  };
};

type FindEligibleMethodsErrorResponse = {
  name: string;
  message: string;
  debug_id: string;
};

export async function findEligibleMethods(payload: FindEligibleMethodsOptions) {
  const accessToken = await getFullScopeAccessToken();

  const response = await fetch(
    `${BASE_URL}/v2/payments/find-eligible-methods`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en_US",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const jsonResponse = await response.json();

  if (!response.ok) {
    const { message } = jsonResponse as FindEligibleMethodsErrorResponse;
    throw new CustomApiError({
      message: message || "Failed to find eligible methods",
      statusCode: response.status,
      jsonResponse,
    });
  }

  return jsonResponse as FindEligibleMethodsSuccessResponse;
}
