<script setup>
import { NSpace, NButton, NForm, NFormItem, NInput, NSpin, useMessage } from "naive-ui";
import { onMounted, ref } from "vue";
import { request } from '../../../common/request';
import { p2bMsg } from "../../../common/wrap";
import { useRouter } from "vue-router";

const message = useMessage()
const router = useRouter()

const formValue = ref({ keys: "", password: "" })
const loading = ref(false)
const isUnlocked = ref(false)

onMounted(async () => {
  const res = await request(p2bMsg("account_unlocked"))
  isUnlocked.value = res.value
})

async function save() {
  loading.value = true
  const res = await request(p2bMsg('import_account', formValue.value))
  if (res.err) {
    message.error(res.err)
  }

  loading.value = false
  router.push({ name: 'account' })
}

</script>

<template>
  <n-spin :show="loading">
    <n-space class="container" vertical align="center">
      <div class="header">导入账户</div>
      <div class="description">可单个或批量导入私钥</div>
      <n-form :model="formValue" label-placement="left" label-align="left" size="small">
        <n-form-item label="" path="keys">
          <n-input class="form-input private-key" v-model:value="formValue.keys" type="textarea" placeholder="私钥" round
            clearable size="large" />
        </n-form-item>
        <n-form-item v-if="!isUnlocked" label="密码" path="password">
          <n-input class="form-input" v-model:value="formValue.password" type="password" show-password-on="mousedown"
            placeholder="钱包密码" :maxlength="16" :minlength="8" clearable />
        </n-form-item>
      </n-form>
      <n-button class="confirm-button" round type="info" @click="save">
        导入
      </n-button>
    </n-space>
  </n-spin>
</template>

<style scoped>
.header {
  margin-top: 30px;
  font-size: 36px;
}

.description {
  margin-bottom: 30px;
}

.form-input,
.confirm-button {
  width: 80vw;
}

.private-key {
  font-size: 12px
}
</style>