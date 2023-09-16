import { watch } from 'vue'
import { defineStore } from 'pinia'
import { useAsyncState } from '@vueuse/core'
import { request, requestState } from '../../../common/request'
import { p2bMsg } from "../../../common/wrap"

export const useChainStore = defineStore('chain', () => {
    const { state: chains } = useAsyncState(request(p2bMsg('chain_list')).then(msg => msg.value), [])
    const updateMethods = ['delete_chain', 'setProviderByName']

    watch(requestState, async (req) => {
        if (!updateMethods.includes(req.method)) {
            return
        }
        const res = await request(p2bMsg('chain_list'))
        chains.value = res.value
    })

    return { chains }
})
