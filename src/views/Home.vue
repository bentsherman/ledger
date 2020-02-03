<template>
<div class="row">
	<div class="col-sm-3 col-md-2">
		<div class="card mb-4" v-for="u in users" :key="u.id">
			<h6 class="card-header">{{u.name}}</h6>

			<div class="card-body" v-if="u.url">
				<a :href="u.url">{{u.url}}</a>
			</div>

			<table class="table mb-0">
				<tr v-for="d in u.debts" :key="d.name">
					<td>{{d.name}}</td>
					<td class="text-right" :class="{ 'text-danger': d.amount > 0, 'text-success': d.amount < 0 }">
						<strong>{{d.amount | number(2)}}</strong>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div class="col-sm-9 col-md-10">
		<div class="card">
			<h6 class="card-header">Transactions</h6>

			<div class="card-body">
				<router-link to="/transaction/0">Create transaction</router-link>
			</div>

			<div class="card-body">
				<div class="button-group">
					<button class="btn btn-light" :disabled="page == 0" v-on:click="page > 0 && query(page - 1)">newer</button>
					<button class="btn btn-light" v-on:click="query(page + 1)">older</button>
				</div>
			</div>

			<table class="table mb-0">
				<th scope="col">Date</th>
				<th scope="col">Description</th>
				<th scope="col">Cost ($)</th>
				<th scope="col">Paid By</th>
				<th scope="col">Paid For</th>
				<th scope="col"></th>
				<th scope="col"></th>

				<tbody v-for="t in transactionsView" :key="t.id">
					<tr>
						<td>{{t.date | date}}</td>
						<td>{{t.description}}</td>
						<td class="text-right">{{t.cost | number(2)}}</td>
						<td>{{users[t.creditor_id].short_name}}</td>
						<td>
							<div v-for="id in t.debtors">{{users[id].short_name}}</div>
						</td>
						<td class="text-center">
							<router-link :to="'/transaction/' + t.id">Edit</router-link>
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
			page: 0,
			transactions: [],
			users: []
		}
	},
	mounted: async function() {
		const self = this

		self.users = (await axios.get("/api/users")).data
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

		await self.query(0)
	},
	methods: {
		query: async function(page) {
			this.transactions = (await axios.get(`/api/transactions?page=${page}`)).data
			this.page = page
		},
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
