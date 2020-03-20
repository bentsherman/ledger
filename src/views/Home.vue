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
					<td class="text-right" :class="{ 'text-danger': d.amount > 0.005, 'text-success': d.amount < -0.005 }">
						<strong>{{d.amount | number(2)}}</strong>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div class="col-sm-9 col-md-10">
		<div class="card mb-4">
			<h6 class="card-header">Transactions</h6>

			<div class="card-body">
				<router-link to="/transaction/0">Create transaction</router-link>
			</div>

			<div class="card-body">
				<div class="button-group">
					<button class="btn btn-light" :disabled="page == 0" @click="page > 0 && query(page - 1)">newer</button>
					<button class="btn btn-light" @click="query(page + 1)">older</button>
				</div>
			</div>

			<div class="card-body text-center" v-if="loading">
				<div class="spinner-border"></div>
			</div>

			<table class="table mb-0" v-else>
				<th scope="col">Date</th>
				<th scope="col">Description</th>
				<th scope="col">Cost ($)</th>
				<th scope="col">Paid By</th>
				<th scope="col">Paid For</th>
				<th scope="col"></th>
				<th scope="col"></th>

				<tbody v-for="t in transactions" :key="t.id">
					<tr>
						<td>{{t.date | date}}</td>
						<td>{{t.description}}</td>
						<td class="text-right">{{t.cost | number(2)}}</td>
						<td>{{users[t.creditor_id].short_name}}</td>
						<td>
							<div v-for="(id, index) in t.debtors" :key="index">{{users[id].short_name}}</div>
						</td>
						<td class="text-center">
							<router-link :to="'/transaction/' + t.id">Edit</router-link>
						</td>
						<td class="text-center">
							<span class="button-icon" @click="remove(t)">&times;</span>
						</td>
					</tr>

					<tr v-for="(sub, index) in t.sub_items" :key="index">
						<td></td>
						<td>{{sub.description}}</td>
						<td class="text-right">{{sub.cost | number(2)}}</td>
						<td></td>
						<td>
							<div v-for="(id, index) in sub.debtors" :key="index">{{users[id].short_name}}</div>
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
	data() {
		return {
			page: 0,
			transactions: [],
			users: [],
			loading: false
		}
	},
	async beforeMount() {
		this.users = (await axios.get('/api/users')).data

		await this.query(0)
	},
	methods: {
		async query(page) {
			this.loading = true

			this.transactions = (await axios.get(`/api/transactions?page=${page}`)).data
			this.page = page

			this.loading = false
		},
		async remove(t) {
			if ( !confirm(`Are you sure you want to delete "${t.description}"?`) ) {
				return
			}

			await axios.delete(`/api/transactions/${t.id}`)

			this.$router.go()
		}
	}
}
</script>
