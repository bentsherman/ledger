/**
 * Simple database with a JSON file as a backend.
 */
const fs = require("fs");

function Database()
{
	let tables = {};

	this.load = function(filename) {
		tables = JSON.parse(fs.readFileSync(filename, "utf-8"));
	};

	this.save = function(filename) {
		let data = JSON.stringify(tables, null, "\t");

		fs.writeFileSync(filename, data, "utf-8");
	};

	this.query = function(tableName) {
		return tables[tableName];
	};

	this.find = function(tableName, id) {
		return tables[tableName].find(function(d) {
			return (d.id === id);
		});
	};

	this.push = function(tableName, doc) {
		doc.id = "" + tables[tableName].length;

		tables[tableName].push(doc);
	};

	this.remove = function(tableName, id) {
		let index = tables[tableName].findIndex(function(d) {
			return (d.id === id);
		});

		tables[tableName].splice(index, 1);
	};
}

module.exports = Database;
