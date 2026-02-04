export const createSubscription = async () => {
  try {
    const response = await fetch("/paypal-api/billing/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log("Subscription created:", data);

    return { subscriptionId: data.id };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};
