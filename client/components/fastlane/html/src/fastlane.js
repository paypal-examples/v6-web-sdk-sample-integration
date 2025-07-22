/**
 * Initializes the Fastlane SDK, sets up event listeners for email submission,
 * handles authentication flow, and renders the appropriate user experience.
 * @async
 * @function
 * @returns {Promise<void>}
 */
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

/**
 * Displays the shipping address information in the UI.
 * @param {Object} shippingAddress - The shipping address object.
 * @param {Object} shippingAddress.name - Name object containing fullName.
 * @param {string} shippingAddress.name.fullName - Full name of the recipient.
 * @param {Object} shippingAddress.address - Address object.
 * @param {string} shippingAddress.address.addressLine1 - Street address.
 * @param {string} shippingAddress.address.adminArea2 - City or locality.
 * @param {string} shippingAddress.address.adminArea1 - State or region.
 * @param {string} shippingAddress.address.postalCode - Postal or ZIP code.
 */
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

/**
 * Renders the Fastlane member checkout experience, including shipping address,
 * payment component, and order submission.
 * @async
 * @function
 * @param {Object} profileData - The user's profile data.
 * @param {Object} profileData.shippingAddress - The user's shipping address.
 * @returns {Promise<void>}
 */
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

      const orderResponse = await createOrder(id);
      console.log("orderResponse: ", orderResponse);

      if (orderResponse.status === "COMPLETED") {
        alert("Order completed successfully! Check console for details.");
      } else {
        alert("There was an issue processing your order. Please try again.");
      }
    });
  } else {
    // Render your shipping address form
  }
}

/**
 * Renders the Fastlane guest checkout experience, including payment component
 * and order submission.
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function renderFastlaneGuestExperience() {
  const cardTestingInfo = document.getElementById("card-testing-info");
  cardTestingInfo.removeAttribute("hidden");

  const FastlanePaymentComponent = await fastlane.FastlanePaymentComponent({});
  await FastlanePaymentComponent.render("#card-container");

  const submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", async () => {
    const { id } = await FastlanePaymentComponent.getPaymentToken();

    const orderResponse = await createOrder(id);
    console.log("orderResponse: ", orderResponse);

    if (orderResponse.status === "COMPLETED") {
      alert("Order completed successfully! Check console for details.");
    } else {
      alert("There was an issue processing your order. Please try again.");
    }
  });
}

/**
 * Creates an order by sending a request to the server with the payment token.
 * @async
 * @function
 * @param {string} paymentToken - The payment token from Fastlane.
 * @returns {Promise<Object>} The response from the order creation API.
 */
async function createOrder(paymentToken) {
  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PayPal-Request-Id": Date.now().toString(),
    },
    body: JSON.stringify({
      paymentSource: {
        card: {
          singleUseToken: paymentToken,
        },
      },
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: "10.00",
            breakdown: {
              itemTotal: {
                currencyCode: "USD",
                value: "10.00",
              },
            },
          },
        },
      ],
      intent: "CAPTURE",
    }),
  });
  const orderResponse = await response.json();

  return orderResponse;
}
