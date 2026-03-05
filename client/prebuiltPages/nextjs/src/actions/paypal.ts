"use server";

export const getBrowserSafeClientId = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID is not configured");
  }

  return clientId;
};
