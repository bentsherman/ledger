import * as elements from 'typed-html'

import { date, number } from '../transforms'

function getTextColor(debt) {
    if (debt.amount > 0.005)
        return 'text-danger'
    else if (debt.amount < -0.005)
        return 'text-success'
    else
        return ''
}

function User({ user }) {
    return (
    <div class="card mb-4 fade-in fade-out">
        <h6 class="card-header">{user.name}</h6>

        { user.url && (
        <div class="card-body">
            <a href={user.url}>{user.url}</a>
        </div>
        )}

        <table class="table mb-0">
            {user.debts.map((debt) => (
                <tr>
                    <td>{debt.name}</td>
                    <td class={`text-end ${getTextColor(debt)}`}>
                        <strong>{number(debt.amount, 2)}</strong>
                    </td>
                </tr>
            ))}
        </table>
    </div>
    )
}

export function getUsers(users) {
    return users.map((u) => <User user={u}/>)
}

function TransactionRow({ tx, users }) {
    return (
    <tbody class="fade-in fade-out">
        <tr>
            <td>{date(tx.date)}</td>
            <td>{tx.description}</td>
            <td class="text-end">{number(tx.cost, 2)}</td>
            <td>{users[tx.creditor_id].short_name}</td>
            <td>{tx.debtors.map((id) => users[id].short_name).join(', ')}</td>
            <td class="text-center">
                <a
                    href="#"
                    hx-get={`/transactions/${tx.id}/edit`}
                    hx-target="#modals"
                    hx-swap="innerHTML"
                    data-bs-toggle="modal"
                    data-bs-target="#modals"
                >Edit</a>
            </td>
            <td class="text-center">
                <button
                    type="button"
                    class="btn-close"
                    hx-delete={`/transactions/${tx.id}`}
                    hx-confirm={`Are you sure you want to delete "${tx.description}"?`}
                    hx-target="closest tbody"
                    hx-swap="outerHTML swap:250ms"
                ></button>
            </td>
        </tr>

        {tx.sub_items.map((v) => (
        <tr>
            <td></td>
            <td class="text-body-secondary">{v.description}</td>
            <td class="text-body-secondary text-end">{number(v.cost, 2)}</td>
            <td></td>
            <td class="text-body-secondary">{v.debtors.map((id) => users[id].short_name).join(', ')}</td>
            <td></td>
            <td></td>
        </tr>
        ))}
    </tbody>
    )
}

export function getTransactionsPage({ page, transactions, users }) {
    let header = (
    <thead class="fade-in fade-out">
        <th scope="col">Date</th>
        <th scope="col">Description</th>
        <th scope="col">Cost ($)</th>
        <th scope="col">Paid By</th>
        <th scope="col">Paid For</th>
        <th scope="col"></th>
        <th scope="col"></th>
    </thead>
    )
    let rows = transactions.map((tx) => <TransactionRow tx={tx} users={users}/>)
    let footer = (
    <tfoot class="fade-in fade-out">
        <tr>
            <td colspan="7">
                <div class="text-center">
                    <button
                        class="btn btn-light"
                        hx-get={`/transactions?page=${page + 1}`}
                        hx-target="closest tfoot"
                        hx-swap="outerHTML settle:250ms"
                        hx-indicator=".htmx-indicator"
                    >
                        Load more...
                    </button>
                    <img class="htmx-indicator" src="/spinner.svg"/>
                </div>
            </td>
        </tr>
    </tfoot>
    )

    return page === 0
        ? [header].concat(rows).concat([footer])
        : rows.concat([footer])
}

export function Dashboard() {
    return (
    <div class="row">
        <div
            class="col-sm-3 col-md-2"
            hx-trigger="load, reload-users from:body"
            hx-get="/users"
            hx-target="this"
            hx-swap="innerHTML swap:250ms settle:250ms"
        >
        </div>

        <div class="col-sm-9 col-md-10">
            <div class="card mb-4">
                <h6 class="card-header">Transactions</h6>

                <div class="card-body text-end">
                    <a
                        href="#"
                        hx-get="/transactions/new"
                        hx-target="#modals"
                        hx-swap="innerHTML"
                        data-bs-toggle="modal"
                        data-bs-target="#modals"
                    >Create transaction</a>
                </div>

                <table
                    class="table mb-0"
                    hx-trigger="load, reload-transactions from:body"
                    hx-get="/transactions"
                    hx-target="this"
                    hx-swap="innerHTML swap:250ms settle:250ms"
                >
                </table>
            </div>

            <div id="modals"
                class="modal modal-blur fade"
                style="display: none"
                aria-hidden="false"
                tabindex="-1"
            >
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content"></div>
                </div>
            </div>
        </div>
    </div>
    )
}
