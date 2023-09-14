import * as elements from 'typed-html'

function getSelectOption(value, selected, name) {
    return selected
        ? <option value={value} selected>{name}</option>
        : <option value={value}>{name}</option>
}

function isDebtor(user, debtors) {
    return debtors.indexOf(user.id) !== -1
}

export function TransactionSubItemEdit({ sub_item, users }) {
    return (
    <div
        class="tx-sub-item"
        _="
        on click from .btn-close in me
            transition opacity to 0
            remove me
            send update to #subtotal
        "
    >
        <hr/>

        <div class="row mb-3 justify-content-end">
            <div class="col">
                <button type="button" class="btn-close"></button>
            </div>
        </div>

        <div class="row mb-3">
            <label class="col-sm-3 col-form-label">Description</label>
            <div class="col-sm-9">
                <input
                    class="form-control"
                    name="sub_items.description"
                    value={sub_item.description ?? ''}
                    required
                />
            </div>
        </div>

        <div class="row mb-3">
            <label class="col-sm-3 col-form-label">Cost</label>
            <div class="col-sm-9">
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                        class="form-control"
                        type="number"
                        name="sub_items.cost"
                        value={sub_item.cost ?? ''}
                        required
                    />
                </div>
            </div>
        </div>

        <div class="row mb-3">
            <label class="col-sm-3 col-form-label">Paid For</label>
            <div class="col-sm-9">
                <input
                    type="hidden"
                    name="sub_items.n_debtors"
                    _="
                    def update()
                        set n to 0
                        for opt in next <select/>
                            if opt.selected
                                increment n
                            end
                        end
                        set my value to n
                    end
                    init call update() end
                    on change from next <select/> call update()
                    "
                />

                <select
                    class="form-select"
                    size={users.length}
                    multiple
                    name="sub_items.debtors"
                    required
                >
                    {users.map((u) => getSelectOption(u.id, isDebtor(u, sub_item.debtors), u.name))}
                </select>
            </div>
        </div>
    </div>
    )
}

export function TransactionEdit({ tx, users }) {
    return (
    <div class="modal-dialog modal-dialog-centered">
        <form
            class="modal-content"
            hx-ext="json-enc"
            hx-post={`/transactions/${tx.id !== null ? tx.id : 'new'}`}
            hx-vals={`{"id":"${tx.id}"}`}
            hx-target="closest .modal-dialog"
            hx-swap={tx.id !== null ? 'none' : 'outerHTML'}
            _="
            on blur from <input, select />
                if event.target.checkValidity()
                    add .is-valid to event.target
                    remove .is-invalid from event.target
                else
                    add .is-invalid to event.target
                    remove .is-valid from event.target
            "
        >
            <div class="modal-header">
                <h5 class="modal-title">Transaction</h5>
            </div>
            <div class="modal-body">
                <div class="row mb-3">
                    <label class="col-sm-3 col-form-label">Date</label>
                    <div class="col-sm-9">
                        <input
                            class="form-control"
                            type="date"
                            name="date"
                            value={tx.date ?? ''}
                            placeholder="yyyy-MM-dd"
                            required
                            />
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-sm-3 col-form-label">Description</label>
                    <div class="col-sm-9">
                        <input
                            class="form-control"
                            name="description"
                            value={tx.description ?? ''}
                            required
                            />
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-sm-3 col-form-label">Cost</label>
                    <div class="col-sm-9">
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input
                                class="form-control"
                                type="number"
                                name="cost"
                                value={tx.cost ?? ''}
                                required
                            />
                        </div>

                        <p
                            id="subtotal"
                            class="form-text text-end d-none"
                            _="
                            def updateSubtotal()
                                set form to closest <form/>
                                set cost to form.cost.value
                                set sub_costs to <input[name='sub_items.cost']/>
                                if (no cost) or (no sub_costs)
                                    exit
                                end
                                for sub in sub_costs
                                    decrement cost by sub.value
                                end
                                if cost < 0
                                    add .text-danger to me
                                else
                                    remove .text-danger from me
                                end
                                put Number(cost).toFixed(2) into <output/> in me
                                remove .d-none from me
                            end
                            init call updateSubtotal() end
                            on input from <form/> call updateSubtotal()
                            on update call updateSubtotal()
                        "
                        >(with sub-items removed: $<output></output>)</p>
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-sm-3 col-form-label">Paid By</label>
                    <div class="col-sm-9">
                        <select
                            class="form-select"
                            name="creditor_id"
                            value={tx.creditor_id ?? ''}
                            required
                        >
                            <option value=""></option>
                            {users.map((u) => getSelectOption(u.id, u.id === tx.creditor_id, u.name))}
                        </select>
                    </div>
                </div>

                <div class="row mb-3">
                    <label class="col-sm-3 col-form-label">Paid For</label>
                    <div class="col-sm-9">
                        <select
                            class="form-select"
                            size={users.length}
                            multiple
                            name="debtors"
                            required
                        >
                            {users.map((u) => getSelectOption(u.id, isDebtor(u, tx.debtors), u.name))}
                        </select>
                    </div>
                </div>

                {tx.sub_items.map((sub_item) => TransactionSubItemEdit({ sub_item, users }))}

                <hr id="after-sub-items"/>

                <div class="row mb-3 text-center">
                    <button
                        type="button"
                        class="btn btn-link"
                        hx-get="/transactions/subitems/new"
                        hx-target="#after-sub-items"
                        hx-swap="beforebegin"
                    >Add separate sub-item...</button>
                </div>
            </div>
            <div class="modal-footer justify-content-center">
                <button type="submit" class="btn btn-outline-dark">Save</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </form>
    </div>
    )
}