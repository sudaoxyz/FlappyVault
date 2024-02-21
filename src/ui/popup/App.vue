<script setup>
async function openEvalSocial() {
  await chrome.runtime.sendMessage({ to: 0, method: "home_page", params: { url: 'http://eval.social' } })
}
</script>

<template>
  <div class="container box center column">
    <img src="../../script/icon128.png" alt="" style="width: 50%;">
    <div style="font-weight: bolder; font-size: 18px;">
      Welcome to <span @click="openEvalSocial"><a href="">EvalSocial</a></span>
    </div>
    <div style="font-weight: bolder; font-size: 18px;">
      More features coming soon.
    </div>
  </div>
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

.container {
  width: 100vw;
  height: 90vh;
  gap: 8px;
}
</style>
