const getSandboxUrl = (path) => `http://localhost:8080${path}`;

async function getBrowserSafeClientToken() {
	const response = await fetch(getSandboxUrl("/paypal-api/auth/browser-safe-client-token"), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const { access_token } = await response.json();

	return access_token;
}

async function createOrder() {
	const response = await fetch(getSandboxUrl("/paypal-api/checkout/orders/create"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const orderData = await response.json();

	return { orderId: orderData.id };
}

async function captureOrder({ orderId, headers }) {
	const response = await fetch(
		getSandboxUrl(`/paypal-api/checkout/orders/${orderId}/capture`),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	const data = await response.json();

	return data;
}

async function onApprove(data) {
	const orderData = await captureOrder({
		orderId: data.orderId,
	});

	sendPostMessageToParent({
		eventName: "payment-flow-approved",
		data: orderData,
	});
}

function onCancel(data) {
	sendPostMessageToParent({
		eventName: "payment-flow-canceled",
		data: {
			orderId: data?.orderId,
		},
	});
}

function onError(data) {
	sendPostMessageToParent({
		eventName: "payment-flow-error",
		data: {
			error: data?.error,
		},
	});
}

async function onLoad() {
	try {
		const clientToken = await getBrowserSafeClientToken();
		const sdkInstance = await window.paypal.createInstance({
			clientToken,
			components: ["paypal-payments"],
		});
		const paypalOneTimePaymentSession =
			sdkInstance.createPayPalOneTimePaymentSession({
				onApprove,
				onCancel,
				onError,
			});

		async function onClick() {
			try {
				await paypalOneTimePaymentSession.start(
					{
						presentationMode: "popup",
						fullPageOverlay: { enabled: false },
					},
					createOrder(),
				);
			} catch (e) {
				console.error(e);
			}
		}
		const paypalButton = document.querySelector("#paypal-button");
		paypalButton.addEventListener("click", onClick);
	} catch (e) {
		console.error(e);
	}
}

function sendPostMessageToParent (payload) {
	const {location, parent} = window;
	const parentOrigin = new URLSearchParams(location.search).get("origin");
	parent.postMessage(payload, parentOrigin);
}
