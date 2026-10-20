// Must match the order total the server calculates (its default cart: 2 x 75.00 + 1 x 55.00).
const ORDER_AMOUNT = "205.00";
const ORDER_CURRENCY = "USD";

// Resolves with the token to use for the order, or null when the order must not be created.
async function authenticateWith3DS(paymentToken) {
  // A new helper per authentication, since it holds the state of one flow.
  const threeDomainSecure = sdkInstance.createFastlaneThreeDomainSecure();

  const isEligible = await threeDomainSecure.isEligible({
    amount: ORDER_AMOUNT,
    currency: ORDER_CURRENCY,
    nonce: paymentToken,
    // Always challenge so the demo shows the flow; omit to challenge only when the issuer requires it.
    threeDSRequested: true,
    transactionContext: {
      experience_context: {
        brand_name: "Demo Merchant",
        locale: "en-US",
        // Used if the challenge falls back to a full-page redirect.
        return_url: window.location.href,
        cancel_url: window.location.href,
      },
    },
  });

  if (!isEligible) {
    console.log("Card is not eligible for 3D Secure, continuing without it");
    return paymentToken;
  }

  // authenticationState: "succeeded" | "errored" | "cancelled"
  // liabilityShift (optional): "POSSIBLE" | "YES" | "NO" | "UNKNOWN"
  const { authenticationState, liabilityShift, nonce } =
    await threeDomainSecure.show();
  console.log("3DS result", { authenticationState, liabilityShift });

  if (authenticationState === "cancelled") {
    renderAlert({
      type: "warning",
      message: "3D Secure canceled. Try again or use a different card.",
    });
    return null;
  }

  // Do not continue unless the buyer authenticated and liability may shift to the issuer.
  const liabilityMayShift =
    liabilityShift === "POSSIBLE" || liabilityShift === "YES";
  if (authenticationState !== "succeeded" || !liabilityMayShift) {
    renderAlert({
      type: "danger",
      message: `Payment failed 3D Secure check: "authenticationState: ${authenticationState}, liabilityShift: ${liabilityShift}"`,
    });
    return null;
  }

  // The enriched token replaces the original one and carries the 3DS result.
  return nonce;
}

async function submitOrder(paymentToken) {
  try {
    const orderToken = await authenticateWith3DS(paymentToken);
    if (!orderToken) {
      return;
    }

    const orderResponse = await createOrder(orderToken);
    console.log("orderResponse: ", orderResponse);

    if (orderResponse.status === "COMPLETED") {
      renderAlert({
        type: "success",
        message: "Order successfully captured!",
      });
    } else {
      renderAlert({
        type: "danger",
        message: "There was an issue processing your order. Please try again.",
      });
    }
  } catch (error) {
    renderAlert({
      type: "danger",
      message: `Payment flow error: ${error.message}`,
    });
    console.error(error);
  }
}

async function setupFastlaneSdk() {
  fastlane.setLocale("en_us");

  const fastlaneWatermark = await fastlane.FastlaneWatermarkComponent({
    includeAdditionalInfo: true,
  });
  fastlaneWatermark.render("#watermark-container");

  const emailInput = document.getElementById("email-input");
  const emailSubmitButton = document.getElementById("email-submit-button");
  emailSubmitButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const { customerContextId } = await fastlane.identity.lookupCustomerByEmail(
      emailInput.value,
    );

    let shouldRenderFastlaneMemberExperience = false;
    let profileData;
    if (customerContextId) {
      const response =
        await fastlane.identity.triggerAuthenticationFlow(customerContextId);

      if (response.authenticationState === "succeeded") {
        shouldRenderFastlaneMemberExperience = true;
        profileData = response.profileData;
      }
    }

    const emailForm = document.getElementById("email-form");
    emailForm.setAttribute("hidden", true);

    const submitOrderButton = document.getElementById("submit-button");
    submitOrderButton.removeAttribute("hidden");

    if (shouldRenderFastlaneMemberExperience) {
      renderFastlaneMemberExperience(profileData);
    } else {
      renderFastlaneGuestExperience();
    }
  });
}

function setShippingAddressDisplay(shippingAddress) {
  const {
    name: { fullName },
    address: { addressLine1, adminArea2, adminArea1, postalCode },
  } = shippingAddress;
  const shippingDisplayContainer = document.getElementById(
    "shipping-display-container",
  );
  shippingDisplayContainer.removeAttribute("hidden");
  shippingDisplayContainer.innerHTML = `<b>${fullName}</b><br><b>${adminArea2}</b><br><b>${adminArea1}</b><br><b>${postalCode}</b>`;
}

async function renderFastlaneMemberExperience(profileData) {
  if (profileData.shippingAddress) {
    setShippingAddressDisplay(profileData.shippingAddress);

    const changeAddressButton = document.getElementById(
      "change-shipping-button",
    );

    changeAddressButton.removeAttribute("hidden");
    changeAddressButton.addEventListener("click", async () => {
      const { selectedAddress, selectionChanged } =
        await fastlane.profile.showShippingAddressSelector();

      if (selectionChanged) {
        profileData.shippingAddress = selectedAddress;
        setShippingAddressDisplay(profileData.shippingAddress);
      }
    });

    const fastlanePaymentComponent = await fastlane.FastlanePaymentComponent({
      options: {},
      shippingAddress: profileData.shippingAddress,
    });

    fastlanePaymentComponent.render("#payment-container");

    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", async () => {
      const { id } = await fastlanePaymentComponent.getPaymentToken();
      await submitOrder(id);
    });
  } else {
    // Render your shipping address form
  }
}

async function renderFastlaneGuestExperience() {
  const cardTestingInfo = document.getElementById("card-testing-info");
  cardTestingInfo.removeAttribute("hidden");

  const FastlanePaymentComponent = await fastlane.FastlanePaymentComponent({});
  await FastlanePaymentComponent.render("#card-container");

  const submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", async () => {
    const { id } = await FastlanePaymentComponent.getPaymentToken();
    await submitOrder(id);
  });
}

async function createOrder(paymentToken) {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-card-with-single-use-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentToken,
      }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to create order");
  }
  const orderResponse = await response.json();

  return orderResponse;
}
