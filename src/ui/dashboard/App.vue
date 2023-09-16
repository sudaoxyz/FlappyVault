<script setup>
import { NAlert, NButton, NInput, NForm, NFormItem } from 'naive-ui';
import { request } from '../../common/request';
import { p2bMsg } from '../../common/wrap';
import { ref } from 'vue';
import { toQuantity } from 'ethers';

const formValue = ref({
  chain_name: '',
  chain_id: '',
  currency_symbol: '',
  rpc_url: '',
  currency_name: '',
  currency_decimals: 18,
  explorer_url: ''
})

async function addChain() {
  try {
    const chain = {
      chain_name: formValue.value.chain_name,
      chain_id: toQuantity(formValue.value.chain_id),
      currency_symbol: formValue.value.currency_symbol,
      rpc_url: formValue.value.rpc_url,
      currency_name: formValue.value.currency_symbol,
      currency_decimals: formValue.value.currency_decimals,
      explorer_url: formValue.value.explorer_url,
    }

    await request(p2bMsg('add_chain', chain))
    alert('添加成功')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<template>
  <n-message-provider closable>
    <div class="container box center column">
      <div class="header">手动添加网络</div>
      <div class="alert-wrapper">
        <n-alert title="" type="warning" :bordered="false">
          恶意网络提供商可能会谎报区块链的状态并记录您的网络活动。只添加您信任的自定义网络。
        </n-alert>
      </div>
      <div class="content">
        <n-form ref="formRef" label-placement="top" :model="formValue">
          <n-form-item label="Name" path="chain_name">
            <n-input v-model:value="formValue.chain_name" placeholder="名称" />
          </n-form-item>
          <n-form-item label="ChainID" path="chain_id">
            <n-input v-model:value="formValue.chain_id" placeholder="链ID" />
          </n-form-item>
          <n-form-item label="Symbol" path="currency_symbol">
            <n-input v-model:value="formValue.currency_symbol" placeholder="币符号" />
          </n-form-item>
          <n-form-item label="RPC" path="rpc_url">
            <n-input v-model:value="formValue.rpc_url" placeholder="rpc地址" />
          </n-form-item>
        </n-form>
        <div class="button-wrapper box center">
          <n-button class="add-button" round type="info" @click="addChain">
            添加网络
          </n-button>
        </div>

      </div>
    </div>
  </n-message-provider>
</template>

<style scoped>
.box {
  display: flex;
  box-sizing: border-box;
}

.center {
  justify-content: center;
  align-items: center;
}

.column {
  flex-direction: column;
}

.header {
  font-size: 36px;
}


.container {
  width: 100vw;
  height: 100vh;
  gap: 30px;
}

.alert-wrapper,
.content {
  width: 40vw;
}

.button-wrapper {
  width: 40vw;
}

.add-button {
  width: 100%;
}
</style>
