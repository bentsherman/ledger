import Vue from 'vue'
import Vuelidate from 'vuelidate'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

Vue.config.productionTip = false

Vue.use(Vuelidate)

Vue.filter('date', function(value, format) {
	let date = new Date(value)
	let yyyy = date.getUTCFullYear()
	let MM = date.getUTCMonth() + 1
	let dd = date.getUTCDate()

	return `${MM}/${dd}/${yyyy}`
})

Vue.filter('json', function(value) {
	return JSON.stringify(value, null, 2);
});

Vue.filter('number', function(value, fractionSize) {
	return Number.parseFloat(value).toFixed(fractionSize)
})

new Vue({
	router,
	render: function (h) { return h(App) }
}).$mount('#app')
