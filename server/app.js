const express = require("express");
const fs = require("fs");
const logger = require("morgan");

// initialize constants, data
const DOC_ROOT = "dist";

// initialize app
const app = express();

// initialize middleware
app.use(logger("dev"));

// define routes
app.use("/", express.static(DOC_ROOT));

// define 404 handler
app.use(function(req, res) {
	res.status(404).send("Not Found: " + req.originalUrl);
});

// define error handler
app.use(function(err, req, res, next) {
	if ( res.headersSent ) {
		return next(err);
	}

	res.status(500).send({ message: err.message });
});

// start HTTP web server
app.listen(8080);
