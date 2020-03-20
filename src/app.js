import Vue from 'vue'
import Vuelidate from 'vuelidate'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

Vue.config.productionTip = false

Vue.use(Vuelidate)

Vue.filter('date', (value, format) => {
	let date = new Date(value)
	let yyyy = date.getUTCFullYear()
	let MM = date.getUTCMonth() + 1
	let dd = date.getUTCDate()

	return `${MM}/${dd}/${yyyy}`
})

Vue.filter('json', (value) => {
	return JSON.stringify(value, null, 2);
});

Vue.filter('number', (value, fractionSize) => {
	return Number.parseFloat(value).toFixed(fractionSize)
})

new Vue({
	router,
	render(h) { return h(App) }
}).$mount('#app')
