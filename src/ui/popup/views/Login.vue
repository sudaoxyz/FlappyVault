<script setup>
import { NSpace, NButton, NForm, NFormItem, NInput, NSpin, useMessage } from "naive-ui";
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { request } from '../../../common/request';
import { p2bMsg } from '../../../common/wrap';
import { useAccountStore } from "../stores/account";

const accountStore = useAccountStore()
const router = useRouter()
const route = useRoute()
const message = useMessage()
const loading = ref(false)

onMounted(async () => {
})

const formValue = ref({
  password: ""
})

async function unlock() {
  loading.value = true
  const res = await request(p2bMsg('unlock_account', formValue.value.password))
  loading.value = false
  if (res.err) {
    message.error(`密码错误`)
  } else {
    await request(p2bMsg('confirm_noti', { id: id(), data: true }))
    accountStore.setLogin(true)
    router.push({ name: 'account' })
  }
}

async function handleKeyUp(e) {
  if (e.key == "Enter") {
    await unlock()
  }
}

function id() {
  return window.location.search.substring(1).split('=')[1]
}
</script>
<template>
  <n-spin :show="loading">
    <n-space class="container" vertical align="center">
      <div class="header">欢迎回来</div>
      <div class="description">高效、自动化的玩转去中心化网络！</div>
      <n-form ref="formRef" inline :label-width="180" :model="formValue">
        <n-form-item label="密码" path="password">
          <n-input class="login-input" v-model:value="formValue.password" type="password" show-password-on="mousedown"
            @keyup="handleKeyUp" placeholder="密码" :maxlength="16" :minlength="8" clearable autofocus />
        </n-form-item>
      </n-form>
      <n-button class="login-button" round type="info" @click="unlock">
        登陆
      </n-button>
    </n-space>
  </n-spin>
</template>

<style scoped>
.header {
  margin-top: 70px;
  font-size: 36px;
}

.description {
  margin-bottom: 50px;
}

.login-input,
.login-button {
  width: 80vw;
}
</style>