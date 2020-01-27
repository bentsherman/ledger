<template>
<div class="row">
	<div class="col-sm-3 col-md-2">
		<div class="panel panel-default" v-for="u in users" v-bind:key="u.id">
			<div class="panel-heading">
				<h3 class="panel-title">{{u.name}}</h3>
			</div>

			<div class="panel-body">
				<a v-bind:href="u.url">{{u.url}}</a>
			</div>

			<table class="table">
				<tr v-for="d in u.debts" v-bind:key="d.name">
					<td>{{d.name}}</td>
					<td class="text-right" v-bind:class="{ 'text-danger': d.amount > 0, 'text-success': d.amount < 0 }">
						<strong>{{d.amount | number(2)}}</strong>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div class="col-sm-9 col-md-10">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h3 class="panel-title">Transactions</h3>
			</div>

			<div class="panel-body">
				<router-link to="/transaction/0">Create transaction</router-link>
			</div>

			<table class="table">
				<th>Date</th>
				<th>Description</th>
				<th>Cost ($)</th>
				<th>Paid By</th>
				<th>Paid For</th>
				<th></th>
				<th></th>

				<tbody v-for="t in transactionsView" v-bind:key="t.id">
					<tr>
						<td>{{t.date | date}}</td>
						<td>{{t.description}}</td>
						<td class="text-right">{{t.cost | number(2)}}</td>
						<td>{{users[t.creditor_id].short_name}}</td>
						<td>
							<div v-for="id in t.debtors">{{users[id].short_name}}</div>
						</td>
						<td class="text-center">
							<router-link class="button-icon" :to="'/transaction/' + t.id">
								<span class="glyphicon glyphicon-pencil"></span>
							</router-link>
						</td>
						<td class="text-center">
							<span class="button-icon" v-on:click="deleteTransaction(t)">&times;</span>
						</td>
					</tr>

					<tr v-for="sub in t.sub_items">
						<td></td>
						<td>{{sub.description}}</td>
						<td class="text-right">{{sub.cost | number(2)}}</td>
						<td></td>
						<td>
							<div v-for="id in sub.debtors">{{users[id].short_name}}</div>
						</td>
						<td></td>
						<td></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'home',
	data: function() {
		return {
			transactions: [],
			users: []
		}
	},
	mounted: async function() {
		const self = this

		self.users = (await axios.get("/api/users")).data
		self.transactions = (await axios.get("/api/transactions")).data

		self.users.forEach(function(u1) {
			u1.debts = self.users
				.map(function(u2) {
					return {
						id: u2.id,
						name: u2.name,
						amount: self.computeDebt(u1, u2)
					}
				})
				.filter(function(u2) {
					return (u1.name !== u2.name);
				})
		})
	},
	methods: {
		computeDebt: function(debtor, creditor) {
			// flatten transactions and sub-items into array
			let transactions = this.transactions
				.reduce(function(prev, t) {
					t.sub_items.forEach(function(sub) {
						sub.creditor_id = t.creditor_id
					})

					return prev.concat([t], t.sub_items)
				}, [])

			// compute debts
			let debt = transactions
				.filter(function(t) {
					return (t.creditor_id === creditor.id && t.debtors.indexOf(debtor.id) !== -1)
				})
				.reduce(function(sum, t) {
					return sum + t.cost / t.debtors.length
				}, 0)

			// compute credits
			let credit = transactions
				.filter(function(t) {
					return (t.creditor_id === debtor.id && t.debtors.indexOf(creditor.id) !== -1)
				})
				.reduce(function(sum, t) {
					return sum + t.cost / t.debtors.length
				}, 0)

			return debt - credit
		},
		deleteTransaction: async function(t) {
			if ( !confirm(`Are you sure you want to delete "${t.description}"?`) ) {
				return
			}

			await axios.delete(`/api/transactions/${t.id}`)

			this.$router.go()
		}
	},
	computed: {
		transactionsView: function() {
			return this.transactions
				.slice()
				.sort(function(a, b) {
					return b["date"].localeCompare(a["date"])
				})
		}
	}
}
</script>
