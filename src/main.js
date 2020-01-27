import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.config.productionTip = false

Vue.filter('date', function(value) {
  let date = new Date(value)
  return `${date.getMonth()}/${date.getDate()}/${date.getYear()}`
})

Vue.filter('number', function(value, fractionSize) {
  return Number.parseFloat(value).toFixed(fractionSize)
})

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
