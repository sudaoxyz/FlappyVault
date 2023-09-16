<script setup>
import { NAlert, NButton, NInput } from 'naive-ui';
import { request } from '../../common/request';
import { p2bMsg } from '../../common/wrap';
import { onMounted, ref } from 'vue';

const noti = ref({ msg: { params: [] } })

onMounted(async () => {
  const res = await request(p2bMsg('noti_msg', id()))
  noti.value = res.value
})

const confirm = async (ok) => {
  await request(p2bMsg('confirm_noti', { id: id(), data: ok }))
  window.close()
}

function id() {
  return window.location.search.substring(1).split('=')[1]
}
</script>

<template>
  <div class="confirm">
    <div class="container box center" v-if="noti.msg.method == 'eth_sendTransaction'">
      <div class="left box center column">
        <div class="left-content box column">
          <div class="transfer box center column">
            <n-button style="width: 90%;font-size: 12px;" dashed strong>
              {{ noti.msg.params[0].from }}
            </n-button>
            <span style="color: #2080f0;">↓</span>
            <n-button style="width: 90%;font-size: 12px;" dashed strong>
              {{ noti.msg.params[0].to }}
            </n-button>
          </div>
          <n-alert style="width: 90%;" title="DAPP信息" type="info">
            <div class="box column">
              <div>网页ID:{{ noti.tabId }}</div>
              <div>标题:{{ noti.title }}</div>
              <div>链接:{{ noti.url }}</div>
            </div>
          </n-alert>
        </div>
      </div>
      <div class="right box center column">
        <n-input style="height: 100%" type="textarea" size="small" v-model:value="noti.msg.params[0].data"
          :disabled="!active" round />
      </div>
    </div>
    <div class="container box center" v-if="noti.msg.method == 'personal_sign'">
      <div class="left box center column">
        <div class="left-content box column">
          <div class="transfer box center column">
            <n-button style="width: 90%;font-size: 12px;" dashed strong>
              Sign Message
            </n-button>
            <span style="color: #2080f0;">↓</span>
            <n-button style="width: 90%;font-size: 12px;" dashed strong>
              {{ noti.msg.params[1] }}
            </n-button>
          </div>
          <n-alert style="width: 90%;" title="DAPP信息" type="info">
            <div class="box column">
              <div>网页ID:{{ noti.tabId }}</div>
              <div>标题:{{ noti.title }}</div>
              <div>链接:{{ noti.url }}</div>
            </div>
          </n-alert>
        </div>
      </div>
      <div class="right box center column">
        <n-input style="height: 100%" type="textarea" size="small" v-model:value="noti.msg.params[0]"
          :disabled="!active" round />
      </div>
    </div>
    <div class="wrapper box">
      <n-button @click="confirm(false)" style="width: 30%;background-color: white;" type="info" size="large" round
        dashed>取消</n-button>
      <n-button @click="confirm(true)" style="width: 30%;" type="info" size="large" round>确认</n-button>
    </div>
  </div>
</template>

<style>
.n-input-wrapper {
  background-color: white;
}
</style>

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

.confirm {
  width: 650px;
  height: 457px;
  background-color: #fdfdfd;
}

.container {
  height: 400px;
  gap: 10px;
}

.wrapper {
  width: 100%;
  height: 57px;
  align-items: center;
  justify-content: space-around;
}

.left,
.right {
  height: 380px;
}

.left {
  width: 420px;
}

.right {
  width: 200px;
}

.left-content {
  width: 100%;
  height: 100%;
  border: 1px solid rgb(224, 224, 230);
  border-radius: 3px;
  gap: 25px;
  padding-top: 10px;

  justify-content: start;
  align-items: center;

  background-color: white;
}

.transfer {
  width: 100%;
}
</style>
