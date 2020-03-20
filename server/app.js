const bodyParser = require('body-parser')
const Database = require('./database')
const express = require('express')
const logger = require('morgan')

// initialize constants
const DOC_ROOT = 'dist'
const DB_FILENAME = 'data/db.json'
const DB_FILENAME_BACKUP = 'data/db.backup.json'

// initialize database
const db = new Database()

db.load(DB_FILENAME)
db.save(DB_FILENAME_BACKUP)

// initialize app
const app = express()

// initialize middleware
app.use(bodyParser.json())
app.use(logger('dev'))

// define routes
app.use('/', express.static(DOC_ROOT))

app.get('/api/transactions', (req, res) => {
	let page = Number.parseInt(req.query.page || 0)
	let pageSize = 100

	let docs = db.query('transactions')
		.sort((a, b) => b['date'].localeCompare(a['date']))
		.slice(page * pageSize, (page + 1) * pageSize)

	res.status(200).send(docs)
})

app.get('/api/transactions/:id', (req, res) => {
	let doc = db.find('transactions', req.params.id)

	if ( doc ) {
		res.status(200).send(doc)
	}
	else {
		res.status(404).end()
	}
})

app.post('/api/transactions/0', (req, res) => {
	let doc = req.body

	db.push('transactions', doc)
	db.save(DB_FILENAME)

	res.status(200).end()
})

app.post('/api/transactions/:id', (req, res) => {
	let doc = req.body

	db.update('transactions', req.params.id, doc)
	db.save(DB_FILENAME)

	res.status(200).end()
})

app.delete('/api/transactions/:id', (req, res) => {
	db.remove('transactions', req.params.id)
	db.save(DB_FILENAME)

	res.status(200).end()
})

const computeDebt = (debtor, creditor) => {
	// flatten transactions and sub-items into array
	let transactions = db.query('transactions')
		.reduce((prev, t) => {
			t.sub_items.forEach((sub) => {
				sub.creditor_id = t.creditor_id
			})

			return prev.concat([t], t.sub_items)
		}, [])

	// compute debts
	let debt = transactions
		.filter((t) => (t.creditor_id === creditor.id && t.debtors.indexOf(debtor.id) !== -1))
		.reduce((sum, t) => (sum + t.cost / t.debtors.length), 0)

	// compute credits
	let credit = transactions
		.filter((t) => (t.creditor_id === debtor.id && t.debtors.indexOf(creditor.id) !== -1))
		.reduce((sum, t) => (sum + t.cost / t.debtors.length), 0)

	return debt - credit
}

app.get('/api/users', (req, res) => {
	let users = db.query('users')

	users.forEach((u1) => {
		u1.debts = users
			.map((u2) => {
				return {
					id: u2.id,
					name: u2.name,
					amount: computeDebt(u1, u2)
				}
			})
			.filter((u2) => (u1.name !== u2.name))
	})

	res.status(200).send(users)
})

// define 404 handler
app.use((req, res) => {
	res.status(404).send('Not Found: ' + req.originalUrl)
})

// define error handler
app.use((err, req, res, next) => {
	if ( res.headersSent ) {
		return next(err)
	}

	res.status(500).send(err.message)
})

// start HTTP web server
app.listen(8080)
