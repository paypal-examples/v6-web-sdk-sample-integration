function setupPage () {
	const origin = window.location.origin;
	document.querySelector('#merchantDomain').innerHTML = origin;
}

function setupPostMessageListener () {
	window.addEventListener("message", (event) => {
		if (event.origin !== "https://localhost:3000") {
			return;
		}

		const {eventName, data} = event.data;

    const statusContainer = document.querySelector("#postMessageStatus");

		if (eventName === "payment-flow-approved") {
      statusContainer.innerHTML = `approved, order id ${JSON.stringify(data)}`;
    } else if (eventName === "payment-flow-canceled") {
      statusContainer.innerHTML = `canceled, order id ${data.orderId}`;
    } else if (eventName === "payment-flow-error") {
      statusContainer.innerHTML = `error, order id ${data.error.message}`;
    }
	});
}

function onLoad() {
	setupPage();
	setupPostMessageListener();
}
