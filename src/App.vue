<template>
  <div id="app">
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import { healthUsingGet } from '@/api/mainController.ts'
import { useLoginUserStores } from '@/stores/useLoginUserStores.ts'

const loginUserStore = useLoginUserStores()
loginUserStore.fetchLoginUser()
console.log('1' + loginUserStore.loginUser.username)

healthUsingGet().then((res) => {
  console.log(res)
})
</script>

<style scoped></style>
