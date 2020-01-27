<template>
<div class="row">
	<div class="col-sm-8 col-sm-offset-2">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h3 class="panel-title">Create Transaction</h3>
			</div>

			<form class="panel-body form-horizontal" name="form">
				<div class="form-group">
					<label class="col-sm-3 control-label">Date</label>
					<div class="col-sm-6">
						<input class="form-control" type="date" name="date" v-model="transaction.date" required placeholder="yyyy-mm-dd"/>
					</div>
				</div>

				<div class="form-group">
					<label class="col-sm-3 control-label">Description</label>
					<div class="col-sm-6">
						<input class="form-control" name="description" v-model="transaction.description" required/>
					</div>
				</div>

				<div class="form-group">
					<label class="col-sm-3 control-label">Cost</label>
					<div class="col-sm-6">
						<div class="input-group">
							<div class="input-group-addon">$</div>
							<input class="form-control" type="number" name="cost" v-model="transaction.cost" required/>
						</div>

						<p class="help-block text-right">(with sub-items removed: ${{getSubTotal(transaction) | number(2)}})</p>
					</div>
				</div>

				<div class="form-group">
					<label class="col-sm-3 control-label">Paid By</label>
					<div class="col-sm-6">
						<select class="form-control" name="creditor_id" v-model="transaction.creditor_id" required>
							<option v-for="u in users" v-bind:key="u.id" v-bind:value="u.id">{{u.name}}</option>
						</select>
					</div>
				</div>

				<div class="form-group">
					<label class="col-sm-3 control-label">Paid For</label>
					<div class="col-sm-6">
						<select class="form-control" size="5" multiple name="debtors" v-model="transaction.debtors" required>
							<option v-for="u in users" v-bind:key="u.id" v-bind:value="u.id">{{u.name}}</option>
						</select>
					</div>
				</div>

				<div v-for="t in transaction.sub_items" v-bind:key="t.id">
					<hr>

					<span class="close" v-on:click="transaction.sub_items.splice($index, 1)">&times;</span>

					<div class="form-group">
						<label class="col-sm-3 control-label">Description</label>
						<div class="col-sm-6">
							<input class="form-control" v-model="t.description" required/>
						</div>
					</div>

					<div class="form-group">
						<label class="col-sm-3 control-label">Cost</label>
						<div class="col-sm-6">
							<div class="input-group">
								<div class="input-group-addon">$</div>
								<input class="form-control" type="number" v-model="t.cost" required/>
							</div>
						</div>
					</div>

					<div class="form-group">
						<label class="col-sm-3 control-label">Paid For</label>
						<div class="col-sm-6">
							<select class="form-control" size="5" multiple v-model="t.debtors" required>
								<option v-for="u in users" v-bind:key="u.id" v-bind:value="u.id">{{u.name}}</option>
							</select>
						</div>
					</div>
				</div>

				<hr>

				<div class="form-group text-center">
					<a href="" v-on:click="transaction.sub_items.push({})">Add separate sub-item...</a>
				</div>

				<hr>

				<div class="text-center">
					<button type="button" class="btn btn-default" v-on:click="save(transaction)">Save</button>
					<a href="/">Cancel</a>
				</div>
			</form>
		</div>
	</div>
</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'transaction',
	props: {
		"id": String
	},
	data: function() {
		return {
			users: [],
			transaction: {
				debtors: [],
				sub_items: []
			}
		}
	},
	mounted: async function() {
		const self = this

		self.users = (await axios.get("/api/users")).data

		if ( self.id !== "0" ) {
			self.transaction = (await axios.get(`/api/transactions/${self.id}`)).data

			self.transaction.sub_items.forEach(function(t) {
				self.transaction.cost += t.cost
			})
		}
	},
	methods: {
		getSubTotal: function(transaction) {
			let sum = transaction.sub_items.reduce(function(sum, t) {
				return sum + t.cost
			}, 0)

			return transaction.cost - sum
		},
		save: async function(transaction) {
			// subtract cost of sub-transactions from main transaction
			transaction.cost = this.getSubTotal(transaction)

			await axios.post(`/api/transactions/${transaction.id}`, transaction)

			this.$router.push("/")
		}
	}
}
</script>