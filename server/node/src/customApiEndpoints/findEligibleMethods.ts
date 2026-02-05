import { z } from "zod/v4";
import { BASE_URL, CustomApiError, getFullScopeAccessToken } from "./utils";

const PurchaseUnitSchema = z.object({
  amount: z.object({
    currency_code: z.string().length(3),
    value: z.string().optional(),
  }),
  payee: z
    .object({
      merchant_id: z.string().optional(),
    })
    .optional(),
});

const FindEligibleMethodsRequestSchema = z.object({
  customer: z
    .object({
      country_code: z.string().length(2).optional(),
    })
    .optional(),
  purchase_units: PurchaseUnitSchema.array().optional(),
  preferences: z
    .object({
      payment_flow: z
        .enum([
          "ONE_TIME_PAYMENT",
          "RECURRING_PAYMENT",
          "VAULT_WITHOUT_PAYMENT",
          "VAULT_WITH_PAYMENT",
        ])
        .optional(),
      payment_source_constraint: z.object({
        constraint_type: z.enum(["INCLUDE", "EXCLUDE"]),
        payment_sources: z.array(z.string()),
      }),
    })
    .optional(),
});

type FindEligibleMethodsRequest = z.infer<
  typeof FindEligibleMethodsRequestSchema
>;

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

export async function findEligibleMethods({
  body,
  userAgent,
}: {
  body: FindEligibleMethodsRequest;
  userAgent?: string;
}) {
  const accessToken = await getFullScopeAccessToken();
  const { success, error, data } =
    FindEligibleMethodsRequestSchema.safeParse(body);

  if (!success) {
    throw new Error(z.prettifyError(error));
  }

  const response = await fetch(
    `${BASE_URL}/v2/payments/find-eligible-methods`,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en_US",
        Authorization: `Bearer ${accessToken}`,
        ...(userAgent && { "User-Agent": userAgent }),
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
