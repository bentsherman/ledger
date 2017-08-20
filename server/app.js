const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const logger = require("morgan");

// initialize constants
const DOC_ROOT = "dist";

// initialize data
const db = {
	transactions: JSON.parse(fs.readFileSync("data/transactions.json", "utf-8")),
	users: JSON.parse(fs.readFileSync("data/users.json", "utf-8"))
};

// initialize app
const app = express();

// initialize middleware
app.use(bodyParser.json());
app.use(logger("dev"));

// define routes
app.use("/", express.static(DOC_ROOT));

app.get("/api/transactions", function(req, res) {
	return res.status(200).send(db.transactions);
});

app.post("/api/transactions/0", function(req, res) {
	const transaction = req.body;
	transaction.id = "" + db.transactions.length;

	db.transactions.push(transaction);
	fs.writeFileSync("data/transactions.json", JSON.stringify(db.transactions), "utf-8");

	res.status(200).end();
});

app.delete("/api/transactions/:id", function(req, res) {
	let index = db.transactions.findIndex(function(t) {
		return (t.id === req.params.id);
	});

	db.transactions.splice(index, 1);
	fs.writeFileSync("data/transactions.json", JSON.stringify(db.transactions), "utf-8");

	res.status(200).end();
});

app.get("/api/users", function(req, res) {
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
