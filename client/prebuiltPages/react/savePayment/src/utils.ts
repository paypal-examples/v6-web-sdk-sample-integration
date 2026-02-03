export const getBrowserSafeClientToken = async () => {
  {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { accessToken } = await response.json();

    return accessToken;
  }
};

export const createVaultToken = async () => {
  try {
    const response = await fetch("/paypal-api/vault/setup-token/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Vault token created:", data);

    return { vaultSetupToken: data.id };
  } catch (error) {
    console.error("Error creating vault token:", error);
    throw error;
  }
};
