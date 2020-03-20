<template>
<div class="row justify-content-center">
	<div class="col-sm-6">
		<div class="card mb-4">
			<h6 class="card-header">Transaction</h6>

			<form class="card-body" v-if="transaction">
				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Date</label>
					<div class="col-sm-9">
						<input
							class="form-control"
							:class="{ 'is-invalid': $v.transaction.date.$error }"
							v-model="$v.transaction.date.$model"
							placeholder="yyyy-MM-dd"/>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Description</label>
					<div class="col-sm-9">
						<input
							class="form-control"
							:class="{ 'is-invalid': $v.transaction.description.$error }"
							v-model="$v.transaction.description.$model"/>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Cost</label>
					<div class="col-sm-9">
						<div class="input-group">
							<div class="input-group-prepend">
								<span class="input-group-text">$</span>
							</div>
							<input
								class="form-control"
								:class="{ 'is-invalid': $v.transaction.cost.$error }"
								type="number"
								v-model.number="$v.transaction.cost.$model"/>
						</div>

						<p class="form-text text-right" v-if="transaction.cost">(with sub-items removed: ${{getSubTotal(transaction) | number(2)}})</p>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Paid By</label>
					<div class="col-sm-9">
						<select
							class="custom-select"
							:class="{ 'is-invalid': $v.transaction.creditor_id.$error }"
							v-model="$v.transaction.creditor_id.$model">
							<option v-for="u in users" :key="u.id" :value="u.id">{{u.name}}</option>
						</select>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Paid For</label>
					<div class="col-sm-9">
						<select
							class="custom-select"
							:class="{ 'is-invalid': $v.transaction.debtors.$error }"
							size="5"
							multiple
							v-model="$v.transaction.debtors.$model">
							<option v-for="u in users" :key="u.id" :value="u.id">{{u.name}}</option>
						</select>
					</div>
				</div>

				<div v-for="(v, index) in $v.transaction.sub_items.$each.$iter" :key="index">
					<hr>

					<div class="form-group row justify-content-end">
						<div class="col">
							<span class="close button-icon" @click="transaction.sub_items.splice(index, 1)">&times;</span>
						</div>
					</div>

					<div class="form-group row">
						<label class="col-sm-3 col-form-label">Description</label>
						<div class="col-sm-9">
							<input
								class="form-control"
								:class="{ 'is-invalid': v.description.$error }"
								v-model="v.description.$model"/>
						</div>
					</div>

					<div class="form-group row">
						<label class="col-sm-3 col-form-label">Cost</label>
						<div class="col-sm-9">
							<div class="input-group">
								<div class="input-group-prepend">
									<span class="input-group-text">$</span>
								</div>
								<input
									class="form-control"
									:class="{ 'is-invalid': v.cost.$error }"
									type="number"
									v-model.number="v.cost.$model"/>
							</div>
						</div>
					</div>

					<div class="form-group row">
						<label class="col-sm-3 col-form-label">Paid For</label>
						<div class="col-sm-9">
							<select
								class="custom-select"
								:class="{ 'is-invalid': v.debtors.$error }"
								size="5"
								multiple
								v-model="v.debtors.$model">
								<option v-for="u in users" :key="u.id" :value="u.id">{{u.name}}</option>
							</select>
						</div>
					</div>
				</div>

				<hr>

				<div class="form-group row text-center">
					<button type="button" class="btn btn-link" @click="addSubItem(transaction)">Add separate sub-item...</button>
				</div>

				<hr>

				<div class="text-center">
					<button type="button" class="btn btn-outline-dark" :disabled="$v.$invalid" @click="save(transaction)">Save</button>
					<router-link to="/" class="btn btn-link">Cancel</router-link>
				</div>
			</form>
		</div>
	</div>
</div>
</template>

<script>
import axios from 'axios'
import { required } from 'vuelidate/lib/validators'

export default {
	name: 'transaction',
	props: {
		id: String
	},
	data() {
		return {
			users: [],
			transaction: null
		}
	},
	validations: {
		transaction: {
			date: { required },
			description: { required },
			cost: { required },
			creditor_id: { required },
			debtors: { required },
			sub_items: {
				$each: {
					description: { required },
					cost: { required },
					debtors: { required }
				}
			}
		}
	},
	async beforeMount() {
		// query users
		this.users = (await axios.get('/api/users')).data

		// get transaction from database
		if ( this.id !== '0' ) {
			// get transaction
			let transaction = (await axios.get(`/api/transactions/${this.id}`)).data

			// add sub-item costs to total cost
			transaction.sub_items.forEach((t) => {
				transaction.cost += t.cost
			})

			// add transaction to scope
			this.transaction = transaction
		}

		// initialize transaction if it is new
		else {
			this.transaction = {
				id: '0',
				date: null,
				description: null,
				cost: null,
				creditor_id: null,
				debtors: [],
				sub_items: []
			}
		}
	},
	methods: {
		/**
		 * Compute the total cost of a transaction with sub-item
		 * costs removed.
		 *
		 * @param {object} transaction
		 */
		getSubTotal(transaction) {
			// compute the cost of all sub-items
			let sum = transaction.sub_items.reduce((sum, t) => (sum + t.cost), 0)

			// remove the sub-item cost from the total cost
			return transaction.cost - sum
		},

		/**
		 * Add a new sub-item to a transaction.
		 *
		 * @param {object} transaction
		 */
		addSubItem(transaction) {
			transaction.sub_items.push({
				description: null,
				cost: null,
				debtors: []
			})
		},

		/**
		 * Save a transaction.
		 *
		 * @param {object} transaction
		 */
		async save(transaction) {
			// subtract sub-item costs from total cost
			transaction.cost = this.getSubTotal(transaction)

			// save transaction
			await axios.post(`/api/transactions/${transaction.id}`, transaction)

			// redirect to the home page
			this.$router.push('/')
		}
	}
}
</script>