import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Transaction from '../views/Transaction.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/transaction/:id',
    name: 'transaction',
    component: Transaction,
    props: true
  }
]

const router = new VueRouter({
  routes
})

export default router
