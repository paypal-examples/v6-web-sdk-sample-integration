async function onLoad() {
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

      const fastlanePaymentComponent =
        await fastlane.FastlanePaymentComponent({
          options: {},
          shippingAddress: profileData.shippingAddress,
        });

      fastlanePaymentComponent.render("#payment-container");

      const submitButton = document.getElementById("submit-button");
      submitButton.addEventListener("click", async () => {
        const { id } = await fastlanePaymentComponent.getPaymentToken();

        const orderResponse = await createOrder(id);
        console.log(orderResponse);
      });
    } else {
      // Render your shipping address form
    }
  }

  async function renderFastlaneGuestExperience() {
    const cardTestingInfo = document.getElementById("card-testing-info");
    cardTestingInfo.removeAttribute("hidden");

    const FastlanePaymentComponent =
      await fastlane.FastlanePaymentComponent({});
    await FastlanePaymentComponent.render("#card-container");

    const submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", async () => {

      const { id } = await FastlanePaymentComponent.getPaymentToken();

      const orderResponse = await createOrder(id);
    });
  }

  const clientTokenResponse = await fetch(
    "/web-sdk/demo/api/paypal/browser-safe-client-token",
  );
  const { access_token: clientToken } = await clientTokenResponse.json();
  const sdkInstance = await window.paypal.createInstance({
    clientToken,
    pageType: "product-details",
    clientMetadataId: crypto.randomUUID(),
    components: ["fastlane"],
  });

  const fastlane = await sdkInstance.createFastlane();

  window.localStorage.setItem("fastlaneEnv", "sandbox");
  fastlane.setLocale("en_us");

  const fastlaneWatermark = await fastlane.FastlaneWatermarkComponent({
    includeAdditionalInfo: true,
  });
  fastlaneWatermark.render("#watermark-container");

  const emailInput = document.getElementById("email-input");
  const emailSubmitButton = document.getElementById(
    "email-submit-button",
  );
  emailSubmitButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const { customerContextId } =
      await fastlane.identity.lookupCustomerByEmail(emailInput.value);

    let shouldRenderFastlaneMemberExperience = false;
    let profileData;
    if (customerContextId) {
      const response =
        await fastlane.identity.triggerAuthenticationFlow(
          customerContextId,
        );

      if (response.authenticationState === "succeeded") {
        shouldRenderFastlaneMemberExperience = true;
        profileData = response.profileData;

      } else {
        shouldRenderFastlaneMemberExperience = false;
      }
    } else {
      shouldRenderFastlaneMemberExperience = false;
    }

    const emailForm = document.getElementById("email-form");
    emailForm.setAttribute("hidden", true);

    if (shouldRenderFastlaneMemberExperience) {
      renderFastlaneMemberExperience(profileData);
    } else {
      renderFastlaneGuestExperience();
    }
  });
}

function createOrder(paymentToken) {
  return fetch("/web-sdk/demo/api/paypal/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_source: {
        card: {
          single_use_token: paymentToken,
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00",
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: "10.00",
              },
            },
          },
          shipping: {
            options: [
              {
                id: "SHIP_FRE",
                label: "Free",
                type: "SHIPPING",
                selected: true,
                amount: {
                  value: "0.00",
                  currency_code: "USD",
                },
              },
              {
                id: "SHIP_EXP",
                label: "Expedited",
                type: "SHIPPING",
                selected: false,
                amount: {
                  value: "5.00",
                  currency_code: "USD",
                },
              },
            ],
          },
        },
      ],
      intent: "CAPTURE",
    }),
  })
    .then((response) => response.json())
    .then((order) => {
      return order.id;
    });
}
