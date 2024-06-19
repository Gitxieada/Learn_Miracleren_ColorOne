<template>
  <div id="app">
    <!--全局提示-->
    <n-message-provider>
      <message-api/>
    </n-message-provider>
    <n-dialog-provider>
      <dialog-api/>
    </n-dialog-provider>


    <router-view/>
  </div>
</template>

<script setup>
import messageApi from "@/components/message-api/index.vue"
import dialogApi from "@/components/dialog-api/index.vue"
</script>

<style>
#app {
  height: 100%;
  overflow: auto;
}
</style>
