import Vue from 'vue'
import App from '../App.vue'
import RocketApp from '../RocketApp.vue'
import Home from '../pages/Home.vue'
import BuyToken from '../pages/BuyToken.vue'
import Token from '../pages/Token.vue'
import Trades from '../pages/Trades.vue'
import $ from 'jquery'

import Vuetify from 'vuetify'
Vue.use(Vuetify)

import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
  base: __dirname,
  scrollBehavior: () => ({
    y: 0
  }),
  routes: [{
      path: '/',
      component: Home,
      name: 'Home'
    }, {
      path: '/buytoken',
      component: BuyToken,
      name: 'BuyToken'
    }, {
      path: '/trades',
      component: Trades,
      name: 'Trades'
    }, {
      path: '/token',
      component: Token,
      name: 'Token'
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

const full = true

if (full) {
  if ($('#app').length > 0) {
    new Vue(Vue.util.extend({
      el: '#app',
      router
    }, App))
  }
} else {
  if ($('#app').length > 0) {
    new Vue(Vue.util.extend({
      el: '#app',
      router
    }, RocketApp))
  }
}
