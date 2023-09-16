import { watch } from 'vue'
import { defineStore } from 'pinia'
import { request, requestState } from '../../../common/request'
import { p2bMsg } from "../../../common/wrap"
import { useAsyncState } from '@vueuse/core'

export const useAccountStore = defineStore('account', () => {
  const { state: accounts, isReady: accountsReady } = useAsyncState(request(p2bMsg('accounts_all')).then(msg => msg.value), [])
  const { state: isLogin, isReady: loginReady } = useAsyncState(request(p2bMsg('account_unlocked')).then(msg => msg.value), false)
  const { state: isImported, isReady: importedReady } = useAsyncState(request(p2bMsg('account_imported')).then(msg => msg.value), false)
  const updateMethods = ['update_account', 'import_account', 'delete_account']

  function setLogin(b) {
    isLogin.value = b
  }

  watch(requestState, async (req) => {
    if (!updateMethods.includes(req.method)) {
      return
    }
    const res = await request(p2bMsg('accounts_all'))
    if (res.value) {
      accounts.value = res.value
    }
  })

  return { accounts, isLogin, isImported, accountsReady, loginReady, importedReady, setLogin }
})
