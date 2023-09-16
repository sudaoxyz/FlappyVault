import { watch } from 'vue'
import { defineStore } from 'pinia'
import { useAsyncState } from '@vueuse/core'
import { request, requestState } from '../../../common/request'
import { p2bMsg } from "../../../common/wrap"

export const useTabsStore = defineStore('tabs', () => {
  const { state: tabs } = useAsyncState(request(p2bMsg('get_tabs')).then(msg => msg.value), [])
  const updateMethods = ['setProviderByName', 'reset_tabs', 'change_tabs_trust', 'refresh_tabs']

  watch(requestState, async (req) => {
    if (!updateMethods.includes(req.method)) {
      return
    }

    // header中切换时不刷新tab
    if (req.method == 'setProviderByName' && (!req.params || !req.params.tabId)) {
      return
    }
    const res = await request(p2bMsg('get_tabs'))
    tabs.value = res.value
  })

  return { tabs }
})
