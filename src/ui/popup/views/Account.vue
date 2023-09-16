<script setup>
import ClipboardJS from "clipboard"
import { formatEther, toBigInt } from 'ethers'
import { useMessage, NDataTable, NButton, NInput, } from "naive-ui"
import { ref, onMounted, computed } from 'vue'
import { request } from '../../../common/request'
import { AccountStatus } from '../../../common/constant'
import { p2bMsg } from "../../../common/wrap"
import { useAccountStore } from "../stores/account"
import { storeToRefs } from "pinia"
import { useRouter } from "vue-router"

const router = useRouter()
const message = useMessage()
const accountStore = useAccountStore()
const { accounts } = storeToRefs(accountStore)

const accountTable = ref(null)
const checkedRowKeys = ref([])
const searchText = ref('')
const balances = ref({})

const columns = [
  { type: "selection", options: ["all", "none"] },
  { title: 'No', key: 'no' },
  { title: 'Address', key: 'address' },
  {
    title: 'Balance', key: 'balance', render: (row, index) => {
      if (!balances.value[row.address]) {
        setTimeout(async () => {
          const res = await request(p2bMsg('eth_getBalance', [row.address, "latest"]))
          const v = res.value ? toBigInt(res.value) : toBigInt(0)
          balances.value[row.address] = parseFloat(formatEther(v)).toFixed(4)
        }, index * 2000)
      }
      return balances.value[row.address]
    }
  }
]
const accountsData = computed(() => {
  const filtered = accounts.value.filter(account => account.address.includes(searchText.value) || account.status.includes(searchText.value))
  return filtered.map((account, index) => { return { no: index, address: account.address, status: account.status, balance: '' } })
})

onMounted(async () => {
  setupCopySelected()
})

async function setOnline(ok) {
  const addresses = JSON.parse(JSON.stringify(checkedRowKeys.value))
  const status = ok ? AccountStatus.Online : AccountStatus.Offline
  const res = await request(p2bMsg('update_account', { addresses: addresses, changes: { status: status } }))
  if (res.err) {
    message.error(res.err)
  }
}

async function deleteAddress() {
  const addresses = JSON.parse(JSON.stringify(checkedRowKeys.value))
  const res = await request(p2bMsg('delete_account', addresses))
  if (res.err) {
    message.error(res.err)
  }
}

async function logout() {
  const res = await request(p2bMsg('lock_account'))
  if (res.err) {
    message.error(res.err)
  }
  router.push({ name: 'login' })
}

function setupCopySelected() {
  new ClipboardJS('.copyBtn', {
    text: () => {
      const addresses = JSON.parse(JSON.stringify(checkedRowKeys.value))
      return addresses.join("\n")
    }
  });
}

function rowClassName(row) {
  return row.status == 'online' ? 'account-row online' : 'account-row'
}

// const jumpToExplorer = async () => {
//   const res = await request(p2bMsg('chain_info'))
//   const chain = res.value
//   await chrome.windows.create({
//     url: chain.explorer_url + '/address/' + selectedAddress.value,
//     type: 'normal'
//   })
// }
</script>
<template>
  <div class="account-header">
    <n-button size="tiny" @click="setOnline(true)">上线</n-button>
    <n-button size="tiny" @click="setOnline(false)">下线</n-button>
    <n-button size="tiny" class="copyBtn">复制已选</n-button>
    <n-button size="tiny" @click="deleteAddress">删除</n-button>
    <n-button size="tiny" @click="logout">退出登陆</n-button>
  </div>
  <div class="account-search">
    <n-input v-model:value="searchText" placeholder="搜索" size="tiny" />
  </div>
  <div class="account-content">
    <n-data-table ref="accountTable" :data="accountsData" v-model:checked-row-keys="checkedRowKeys" :columns="columns"
      :row-key="row => row.address" :pagination="{ pageSize: 10 }" :paginate-single-page="false"
      :row-class-name="rowClassName"></n-data-table>
  </div>
</template>

<style scoped>
.account-header {
  display: flex;
  justify-content: left;
}

.account-header,
.account-search {
  margin: 5px;
  height: 20px;
}

.n-button {
  margin-right: 5px;
}

.account-footer {
  height: 170px;
  background-color: white;
}

.footer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: darkgray;
}
</style>

<style>
.n-data-table .n-data-table-th,
.account-row .n-data-table-td {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

.account-row.online td {
  background-color: aquamarine;
}
</style>