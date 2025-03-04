function setupPage () {
	const origin = window.location.origin;
	document.querySelector('#iframeDomain').innerHTML = origin;
}

setupPage();
