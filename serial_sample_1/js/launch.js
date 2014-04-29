/**
 * Serial Sample 1
 * 2014.04.25 K.OHWADA
 */

chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('main.html', {
		id: "mainwin",
		bounds: {
			width: 360,
			height: 640
		}
	});
});
