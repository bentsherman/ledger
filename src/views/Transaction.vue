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
							:class="{ 'is-invalid': $v.transaction.date.$invalid }"
							v-model="$v.transaction.date.$model"
							placeholder="yyyy-MM-dd"/>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Description</label>
					<div class="col-sm-9">
						<input
							class="form-control"
							:class="{ 'is-invalid': $v.transaction.description.$invalid }"
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
								:class="{ 'is-invalid': $v.transaction.cost.$invalid }"
								type="number"
								v-model.number="$v.transaction.cost.$model"/>
						</div>

						<p class="form-text text-right">(with sub-items removed: ${{getSubTotal(transaction) | number(2)}})</p>
					</div>
				</div>

				<div class="form-group row">
					<label class="col-sm-3 col-form-label">Paid By</label>
					<div class="col-sm-9">
						<select
							class="custom-select"
							:class="{ 'is-invalid': $v.transaction.creditor_id.$invalid }"
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
							:class="{ 'is-invalid': $v.transaction.debtors.$invalid }"
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
								:class="{ 'is-invalid': v.description.$invalid }"
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
									:class="{ 'is-invalid': v.cost.$invalid }"
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
								:class="{ 'is-invalid': v.debtors.$invalid }"
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
					<button type="button" class="btn btn-link" @click="transaction.sub_items.push({debtors: []})">Add separate sub-item...</button>
				</div>

				<hr>

				<div class="text-center">
					<button type="button" class="btn btn-outline-dark" :disabled="$v.transaction.$invalid" @click="save(transaction)">Save</button>
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
		"id": String
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
		this.users = (await axios.get("/api/users")).data

		if ( this.id !== "0" ) {
			let transaction = (await axios.get(`/api/transactions/${this.id}`)).data

			transaction.sub_items.forEach(function(t) {
				transaction.cost += t.cost
			})

			this.transaction = transaction
		}
		else {
			this.transaction = {
				debtors: [],
				sub_items: []
			}
		}
	},
	methods: {
		getSubTotal(transaction) {
			let sum = transaction.sub_items.reduce(function(sum, t) {
				return sum + t.cost
			}, 0)

			return transaction.cost - sum
		},
		async save(transaction) {
			// subtract cost of sub-transactions from main transaction
			transaction.cost = this.getSubTotal(transaction)

			await axios.post(`/api/transactions/${transaction.id}`, transaction)

			this.$router.push("/")
		}
	}
}
</script>