/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/destination/project2dest/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});