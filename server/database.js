/**
 * Simple database with a JSON file as a backend.
 */
const fs = require("fs")

function Database()
{
	let tables = {}

	this.load = function(filename) {
		tables = JSON.parse(fs.readFileSync(filename, "utf-8"))
	}

	this.save = function(filename) {
		let data = JSON.stringify(tables, null, "\t")

		fs.writeFileSync(filename, data, "utf-8")
	}

	this.query = function(tableName) {
		return tables[tableName]
	}

	this.find = function(tableName, id) {
		return tables[tableName].find(function(d) {
			return (d.id === id)
		})
	}

	this.push = function(tableName, doc) {
		let max_id = tables[tableName].reduce(function(prev, d) {
			return Math.max(prev, d.id)
		}, 0)

		doc.id = "" + (max_id + 1)

		tables[tableName].push(doc)
	}

	this.update = function(tableName, id, update) {
		let doc = tables[tableName].find(function(d) {
			return (d.id === id)
		})

		return Object.assign(doc, update)
	}

	this.remove = function(tableName, id) {
		let index = tables[tableName].findIndex(function(d) {
			return (d.id === id)
		})

		return tables[tableName].splice(index, 1)
	}
}

module.exports = Database
