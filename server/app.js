const bodyParser = require("body-parser");
const Database = require("./database");
const express = require("express");
const logger = require("morgan");

// initialize constants
const DOC_ROOT = "dist";
const DB_FILENAME = "data/db.json";
const DB_FILENAME_BACKUP = "data/db.backup.json";

// initialize database
const db = new Database();

db.load(DB_FILENAME);
db.save(DB_FILENAME_BACKUP);

// initialize app
const app = express();

// initialize middleware
app.use(bodyParser.json());
app.use(logger("dev"));

// define routes
app.use("/", express.static(DOC_ROOT));

app.get("/api/transactions", function(req, res) {
	let page = Number.parseInt(req.query.page || 0);
	let pageSize = 100;

	let docs = db.query("transactions")
		.sort(function(a, b) {
			return b["date"].localeCompare(a["date"])
		})
		.slice(page * pageSize, (page + 1) * pageSize);

	res.status(200).send(docs);
});

app.get("/api/transactions/:id", function(req, res) {
	let doc = db.find("transactions", req.params.id);

	if ( doc ) {
		res.status(200).send(doc);
	}
	else {
		res.status(404).end();
	}
});

app.post("/api/transactions/0", function(req, res) {
	let doc = req.body;

	db.push("transactions", doc);
	db.save(DB_FILENAME);

	res.status(200).end();
});

app.post("/api/transactions/:id", function(req, res) {
	let doc = req.body;

	db.update("transactions", req.params.id, doc);
	db.save(DB_FILENAME);

	res.status(200).end();
});

app.delete("/api/transactions/:id", function(req, res) {
	db.remove("transactions", req.params.id);
	db.save(DB_FILENAME);

	res.status(200).end();
});

app.get("/api/users", function(req, res) {
	let docs = db.query("users");

	res.status(200).send(docs);
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

	res.status(500).send(err.message);
});

// start HTTP web server
app.listen(8080);
