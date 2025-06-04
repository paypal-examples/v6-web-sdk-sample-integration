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

function createOrder(paymentToken) {
  return fetch("/paypal-api/checkout/orders/create", {
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
          shipping: {
            options: [
              {
                id: "SHIP_FRE",
                label: "Free",
                type: "SHIPPING",
                selected: true,
                amount: {
                  value: "0.00",
                  currencyCode: "USD",
                },
              },
              {
                id: "SHIP_EXP",
                label: "Expedited",
                type: "SHIPPING",
                selected: false,
                amount: {
                  value: "5.00",
                  currencyCode: "USD",
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
      return order;
    });
}
