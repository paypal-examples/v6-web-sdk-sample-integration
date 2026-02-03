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

async function createOrder(paymentToken) {
  const response = await fetch(
    "/paypal-api/checkout/orders/create-order-for-fastlane",
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
  const orderResponse = await response.json();

  return orderResponse;
}
