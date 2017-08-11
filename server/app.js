const express = require("express");
const fs = require("fs");
const logger = require("morgan");

// initialize constants
const DOC_ROOT = "dist";

// initialize data
const db = {
	users: JSON.parse(fs.readFileSync("data/users.json", "utf-8"))
};

// initialize app
const app = express();

// initialize middleware
app.use(logger("dev"));

// define routes
app.use("/", express.static(DOC_ROOT));

app.use("/api/users", function(req, res) {
	return res.status(200).send(db.users);
});

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
