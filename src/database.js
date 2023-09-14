/**
 * Simple database with a JSON file as a backend.
 */
import fs from 'fs'

export class Database {
	constructor() {
		this.tables = {}
	}

	_clone(value) {
		return JSON.parse(JSON.stringify(value))
	}

	load(filename) {
		this.tables = JSON.parse(fs.readFileSync(filename, 'utf-8'))
	}

	save(filename) {
		let data = JSON.stringify(this.tables, null, '\t')
		fs.writeFileSync(filename, data, 'utf-8')
	}

	query(tableName) {
		return this._clone(this.tables[tableName])
	}

	find(tableName, id) {
		return this._clone(this.tables[tableName].find((d) => (d.id === id)))
	}

	push(tableName, doc) {
		let max_id = this.tables[tableName].reduce((prev, d) => Math.max(prev, d.id), 0)
		doc.id = `${max_id + 1}`
		this.tables[tableName].push(doc)
		return doc.id
	}

	update(tableName, id, update) {
		let doc = this.tables[tableName].find((d) => (d.id === id))
		return Object.assign(doc, update)
	}

	remove(tableName, id) {
		let index = this.tables[tableName].findIndex((d) => (d.id === id))
		return this.tables[tableName].splice(index, 1)
	}
}
