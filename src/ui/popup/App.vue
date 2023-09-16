<script setup>
import { NLayout, NLayoutHeader, NLayoutContent, NMessageProvider, NDialogProvider, NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import Header from '../components/Header.vue'
import { RouterView } from 'vue-router'

</script>
<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-layout>
      <n-layout-header>
        <Header></Header>
      </n-layout-header>
      <n-layout-content content-style="height: 417px;">
        <n-message-provider closable>
          <n-dialog-provider>
            <RouterView />
          </n-dialog-provider>
        </n-message-provider>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<style scoped></style>