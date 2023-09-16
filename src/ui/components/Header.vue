<script setup>
import { NButton, NSelect, NTag, NDropdown } from "naive-ui"
import { computed, h, ref } from "vue";
import { request } from "../../common/request";
import { p2bMsg } from "../../common/wrap";
import { useRouter } from "vue-router";
import { useAccountStore } from "../popup/stores/account";
import { useChainStore } from "../popup/stores/chain";
import { storeToRefs } from "pinia";

const accountStore = useAccountStore()
const chainStore = useChainStore()
const { chains } = storeToRefs(chainStore)
const router = useRouter()

const networkSelectRef = ref(null)

const network = computed(() => {
  const chain = chains.value.find(item => item.isCurrent)
  if (chain) {
    return chain.name
  }
})
const networks = computed(() => {
  return chains.value.map(item => {
    return { label: item.name, value: item.name }
  })
})

const settings = ref([
  { label: "添加网络", key: "add_chain" },
  { label: "导入私钥", key: "import_account" }
])

const updateChain = (value) => {
  return async () => {
    await request(p2bMsg('setProviderByName', { chainName: value }))
    networkSelectRef.value.blur()
  }
}

const selectSetting = async (key) => {
  if (key == 'import_account') {
    router.push({ name: key })
  } else {
    const url = chrome.runtime.getURL('/src/ui/dashboard/index.html')
    await chrome.tabs.create({ url: url })
  }
}

const deleteChain = (chainName) => {
  return async () => {
    await request(p2bMsg('delete_chain', chainName))
  }
}

const renderNetworks = ({ node, option }) => {
  return [
    h(NTag,
      {
        closable: true, bordered: false, color: { color: "#FFFFFF" },
        onClose: deleteChain(option.value), onClick: updateChain(option.value)
      },
      { default: () => option.label }),
    h('br')
  ]
}

const navTo = (name) => {
  router.push({ name: name })
}



// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${JSON.stringify(oldValue)}", new value is "${JSON.stringify(newValue)}".`
//     )
//   }
// })
</script>

<template>
  <div class="header-container">
    <div class="logo">
      <n-button text @click="navTo('home')">
        FishX
      </n-button>
    </div>
    <div class="network">
      <n-select ref="networkSelectRef" v-model:value="network" :options="networks" :consistent-menu-width="false"
        size="small" :render-option="renderNetworks" />
    </div>
    <div class="nav-button">
      <n-button text :disabled="!accountStore.isLogin" @click="navTo('home')">账户</n-button>
      <n-button text :disabled="!accountStore.isLogin" @click="navTo('whitelist')">DAPP</n-button>
      <n-dropdown trigger="hover" :options="settings" @select="selectSetting">
        <n-button text :disabled="!accountStore.isLogin">设置</n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<style scoped>
.n-button {
  padding: 0;
}

.header-container {
  height: 36px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: .5px solid rgb(239, 239, 245);
}

.logo {
  width: 80px;
  padding-left: 10px;
}

.network {
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button {
  display: flex;
  box-sizing: border-box;

  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
}
</style>
