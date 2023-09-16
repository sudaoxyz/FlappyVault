<script setup>
import { NSpin } from "naive-ui";
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router'
import { useAccountStore } from "../stores/account";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";

const accountsStore = useAccountStore()
const router = useRouter()
const { importedReady, loginReady } = storeToRefs(accountsStore)

onBeforeMount(async () => {
  await until(importedReady).toBe(true)
  await until(loginReady).toBe(true)
  if (!accountsStore.isImported) {
    router.push({ name: 'import_account' })
  } else if (accountsStore.isLogin) {
    router.push({ name: 'account' })
  } else {
    router.push({ name: 'login' })
  }
})
</script>
<template>
  <n-spin :show="true" class="spin">
  </n-spin>
</template>

<style scoped>
.spin {
  width: 100vw;
  height: 100vh;
}
</style>