import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { staticPlugin } from '@elysiajs/static'
import * as elements from 'typed-html'

import { Database } from './database'
import { BaseHtml } from './components/BaseHtml'
import { Dashboard, getUsers, getTransactionsPage } from './components/Dashboard'
import { TransactionEdit, TransactionSubItemEdit } from './components/TransactionEdit'

// constants
const DB_FILENAME = 'data/db.json'
const DB_FILENAME_BACKUP = 'data/db.backup.json'

// database
const db = new Database()

db.load(DB_FILENAME)
db.save(DB_FILENAME_BACKUP)

// web application
const app = new Elysia()

app.use(html())
app.use(staticPlugin({ prefix: '/' }))

app.get('/', () => {
    return (
        <BaseHtml>
            <Dashboard/>
        </BaseHtml>
    )
})

app.get('/users', ({ html }) => {
    console.log('GET /users')

    let users = db.query('users')
    let transactions = db.query('transactions')
    computeDebts(users, transactions)

    return html(getUsers(users))
})

function computeDebts(users, transactions) {
    // collect transaction sub items
    let items = transactions.reduce((acc, tx) => {
        // remove sub-item costs from total cost
        tx.cost -= tx.sub_items.reduce((acc, v) => acc + v.cost, 0)

        tx.sub_items.forEach((sub) => {
            sub.creditor_id = tx.creditor_id
        })

        return acc.concat([tx], tx.sub_items)
    }, [])

    // compute each pairwise debt
    users.forEach((u1) => {
        u1.debts = users
            .filter((u2) => (u1.id !== u2.id))
            .map((u2) => {
                return {
                    id: u2.id,
                    name: u2.name,
                    amount: computeDebt(u1, u2, items)
                }
            })
    })

    return users
}

function computeDebt(debtor, creditor, items) {
    // compute total debt
    let debt = items
        .filter((t) => (t.creditor_id === creditor.id && t.debtors.indexOf(debtor.id) !== -1))
        .reduce((sum, t) => (sum + t.cost / t.debtors.length), 0)

    // compute total credit
    let credit = items
        .filter((t) => (t.creditor_id === debtor.id && t.debtors.indexOf(creditor.id) !== -1))
        .reduce((sum, t) => (sum + t.cost / t.debtors.length), 0)

    return debt - credit
}

app.get('/transactions', ({ query, html }) => {
    let page = Number.parseInt(query.page ?? 0)
    let pageSize = 25

    console.log(`GET /transactions (page=${page}, pageSize=${pageSize})`)

    let users = db.query('users')
    let transactions = db.query('transactions')
        .sort((a, b) => b['date'].localeCompare(a['date']))
        .slice(page * pageSize, (page + 1) * pageSize)

    return transactions.length > 0
        ? html(getTransactionsPage({ page, transactions, users }))
        : html()
})

app.get('/transactions/new', () => {
    console.log('GET /transactions/new')

    let tx = {
        id: null,
        date: null,
        description: null,
        cost: null,
        creditor_id: null,
        debtors: [],
        sub_items: []
    }

    let users = db.query('users')
    return <TransactionEdit tx={tx} users={users}/>
})

app.get('/transactions/subitems/new', () => {
    console.log('GET /transactions/subitem/new')

    let sub_item = {
        description: null,
        cost: null,
        debtors: []
    }

    let users = db.query('users')
    return <TransactionSubItemEdit sub_item={sub_item} users={users}/>
})

app.get('/transactions/:id/edit', ({ params, set }) => {
    console.log(`GET /transactions/${params.id}`)

    // get transaction
    let tx = db.find('transactions', params.id)

    if ( !tx ) {
        set.status = 404
        return 'Invalid transaction id'
    }

    let users = db.query('users')
    return <TransactionEdit tx={tx} users={users}/>
})

app.post('/transactions/new', ({ body, set }) => {
    console.log(`POST /transactions/new ${JSON.stringify(body)}`)

    try {
        let id = saveTransaction(null, body)

        set.headers['HX-Trigger'] = JSON.stringify({'reload-users': true, 'reload-transactions': true})

        let tx = db.find('transactions', id)
        let users = db.query('users')
        return <TransactionEdit tx={tx} users={users}/>
    }
    catch (err) {
        set.status = 404
        return 'Invalid input'
    }
})

app.post('/transactions/:id', ({ params, body, set }) => {
    console.log(`POST /transactions/${params.id} ${JSON.stringify(body)}`)

    try {
        saveTransaction(params.id, body)

        set.headers['HX-Trigger'] = JSON.stringify({'reload-users': true, 'reload-transactions': true})
    }
    catch (err) {
        set.status = 404
        return err.message
    }
})

function transposeSubItems(obj) {
    // validate sub-items
    let len = null

    for (let key of ['description', 'cost', 'n_debtors']) {
        let value = obj[key]
        if (!value)
            return []

        if (len !== null && len !== value.length)
            throw new Error('Invalid input')
        else
            len = value.length
    }

    if (len === null)
        return []

    let n_total = obj.n_debtors.reduce((acc, x) => acc + parseInt(x), 0)
    if (obj.debtors.length !== n_total)
        throw new Error('Invalid input')

    // transpose sub-items
    let sub_items = []

    for (let i = 0; i < len; i++) {
        let n_debtors = parseInt(obj.n_debtors[i])
        let sub_item = {
            description: obj.description[i],
            cost: parseInt(obj.cost[i]),
            debtors: obj.debtors.splice(0, n_debtors)
        }
        sub_items.push(sub_item)
    }

    return sub_items
}

function saveTransaction(id, tx) {
    // transpose sub-items
    let obj = {
        description: tx['sub_items.description'],
        cost: tx['sub_items.cost'],
        n_debtors: tx['sub_items.n_debtors'],
        debtors: tx['sub_items.debtors']
    }
    tx.sub_items = transposeSubItems(obj)

    Object.keys(obj).forEach((key) => {
        tx[`sub_items.${key}`] = undefined
    })

    if (id)
        db.update('transactions', id, tx)
    else
        id = db.push('transactions', tx)

    db.save(DB_FILENAME)
    return id
}

app.delete('/transactions/:id', ({ params, set }) => {
    console.log(`DELETE /transactions/${params.id}`)

    db.remove('transactions', params.id)
    db.save(DB_FILENAME)

    set.headers['HX-Trigger'] = 'reload-users'
})

app.listen(8080)

console.log(`Listening at ${app.server?.hostname}:${app.server?.port}`)
