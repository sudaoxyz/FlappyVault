import { createRouter, createWebHashHistory } from 'vue-router'
const Home = () => import('./views/Home.vue')
const Account = () => import('./views/Account.vue')
const ImportAccount = () => import('./views/ImportAccount.vue')
const Login = () => import('./views/Login.vue')
const WhiteList = () => import('./views/WhiteList.vue')

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/importaccount',
      name: 'import_account',
      component: ImportAccount
    },
    {
      path: '/whitelist',
      name: 'whitelist',
      component: WhiteList
    }
  ]
})

export default router
