<script setup>
import { NDataTable, NButton, NInput, NSelect, NTag } from "naive-ui"
import { ref, computed, h } from 'vue'
import { storeToRefs } from "pinia"
import { request } from '../../../common/request'
import { p2bMsg } from "../../../common/wrap"
import { useTabsStore } from "../stores/tabs"
import { useChainStore } from "../stores/chain"

const tabsStore = useTabsStore()
const chainStore = useChainStore()
const { tabs } = storeToRefs(tabsStore)
const { chains } = storeToRefs(chainStore)

const checkedRowKeys = ref([])
const pattern = ref("")

const columns = [
    { type: "selection", options: ["all", "none"] },
    {
        title: 'id', key: 'id', width: 130, ellipsis: {
            tooltip: true
        }
    },
    {
        title: 'title', key: 'title', width: 170, ellipsis: {
            tooltip: true
        }
    },
    {
        title: 'URL', key: 'url', width: 100, ellipsis: {
            tooltip: true
        }
    },
    {
        title: '网络', key: 'network', width: 250, render(row) {
            return h(
                NSelect,
                {
                    options: chains.value,
                    value: row.chainName,
                    size: "small",
                    consistentMenuWidth: false,
                    renderOption: buildRenderNetworks(row.id)
                }
            )
        }
    }
]

const tabsData = computed(() => {
    const filtered = tabs.value.filter(item => item.title.includes(pattern.value) || item.url.includes(pattern.value))
    return filtered.map(item => {
        return {
            id: item.id,
            title: item.title,
            url: item.url,
            trusted: item.trusted,
            chainName: item.chainName
        }
    })
})

const changeTabsTrust = async (trusted) => {
    const ids = JSON.parse(JSON.stringify(checkedRowKeys.value))
    if (ids.length == 0) {
        return
    }

    await request(p2bMsg('change_tabs_trust', { ids, trusted }))
}

const resetTabs = async () => {
    const ids = JSON.parse(JSON.stringify(checkedRowKeys.value))
    if (ids.length == 0) {
        return
    }
    await request(p2bMsg('reset_tabs', ids))
}

function rowClassName(row) {
    return row.trusted ? 'tabs-row trusted' : 'tabs-row'
}


const updateChain = (value, tabId) => {
    return async () => {
        await request(p2bMsg('setProviderByName', { chainName: value, tabId }))
    }
}

function buildRenderNetworks(tabId) {
    return ({ node, option }) => {
        return [
            h(NTag, { bordered: false, color: { color: "#FFFFFF" }, onClick: updateChain(option.name, tabId) },
                { default: () => option.name }),
            h('br')
        ]
    }
}
</script>
<template>
    <div class="list-header">
        <n-button size="tiny" @click="changeTabsTrust(true)">自动确认</n-button>
        <n-button size="tiny" @click="changeTabsTrust(false)">撤销自动</n-button>
        <n-button size="tiny" @click="resetTabs">重置</n-button>
    </div>
    <div class="list-search">
        <n-input v-model:value="pattern" placeholder="搜索" size="tiny" />
    </div>
    <div class="list-content">
        <n-data-table ref="connectedTable" :data="tabsData" v-model:checked-row-keys="checkedRowKeys" :columns="columns"
            :row-key="row => row.id" :pagination="{ pageSize: 10 }" :paginate-single-page="false"
            :row-class-name="rowClassName"></n-data-table>
    </div>
</template>

<style scoped>
.list-header {
    display: flex;
    justify-content: left;
}

.list-header,
.list-search {
    margin: 5px;
    height: 20px;
}

.n-button {
    margin-right: 5px;
}
</style>

<style>
.n-data-table .n-data-table-th,
.tabs-row .n-data-table-td {
    padding-top: 2px !important;
    padding-bottom: 2px !important;
}

.tabs-row.trusted td {
    background-color: aquamarine;
}
</style>