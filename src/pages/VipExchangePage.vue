<template>
  <div id="vipExchangePage">
    <div class="title">
      <h1>兑换会员</h1>
    </div>
    <a-form :model="formState" class="form" @finish="doExchange">
      <a-form-item
        label="兑换码"
        name="vipCode"
        :rules="[{ required: true, message: '请输入兑换码' }]"
      >
        <a-input v-model:value="formState.vipCode" allow-clear placeholder="请输入兑换码" />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="loading"> 兑换 </a-button>
          <a-button @click="doReset" :disabled="loading">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { exchangeVipUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const formState = reactive({
  vipCode: '',
})

const loading = ref(false)

const doReset = () => {
  formState.vipCode = ''
}

const doExchange = async () => {
  const vipCode = formState.vipCode.trim()
  if (!vipCode) {
    message.warning('请输入兑换码')
    return
  }
  if (!loginUserStore.loginUser?.id) {
    message.warning('请先登录')
    await router.push({ path: '/user/login' })
    return
  }
  loading.value = true
  try {
    const res = await exchangeVipUsingPost({ vipCode })
    if (res.data.code === 0 && res.data.data) {
      message.success('兑换成功')
      await loginUserStore.fetchLoginUser()
      doReset()
    } else {
      message.error('兑换失败，' + res.data.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#vipExchangePage {
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
}

.title {
  text-align: center;
  margin-bottom: 30px;
}

.form {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 520px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.ant-form-item-label) {
  font-weight: bold;
  color: #333;
  width: 80px;
  text-align: left;
}
</style>
