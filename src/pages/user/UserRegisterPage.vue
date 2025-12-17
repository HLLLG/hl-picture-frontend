<template>
  <div id="userRegisterPage">
    <div class="title"><H1>HL云图库-用户注册</H1></div>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号!' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码!' },
          { min: 8, message: '密码不能小于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入密码!' },
          { min: 8, message: '确认密码不能小于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入密码" />
      </a-form-item>

      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { useLoginUserStores } from '@/stores/useLoginUserStores.ts'
import { message } from 'ant-design-vue'
import router from '@/router'

const loginUserStore = useLoginUserStores()

// 用于接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})
const handleSubmit = async (values: any) => {
  // 校验两次输入的密码不一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页
  if (res.data.code === 0 || res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userRegisterPage {
  max-width: 360px;
  margin: 0 auto;
}

.title {
  margin-bottom: 16px;
  text-align: center;
}

.desc {
  color: #bbb;
  text-align: center;
  margin-bottom: 16px;
}

.tips {
  color: #bbb;
  text-align: right;
  margin-bottom: 16px;
}
</style>
