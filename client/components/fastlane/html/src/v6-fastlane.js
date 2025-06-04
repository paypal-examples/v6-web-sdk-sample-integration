async function onLoad() {
  async function getBrowserSafeClientToken() {
    const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { accessToken } = await response.json();

    return accessToken;
  }

  const clientToken = await getBrowserSafeClientToken();

  const sdkInstance = await window.paypal.createInstance({
    clientToken,
    pageType: "product-details",
    clientMetadataId: crypto.randomUUID(),
    components: ["fastlane"],
  });

  const fastlane = await sdkInstance.createFastlane();
  window.fastlane = fastlane;
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
      } else {
        shouldRenderFastlaneMemberExperience = false;
      }
    } else {
      shouldRenderFastlaneMemberExperience = false;
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
