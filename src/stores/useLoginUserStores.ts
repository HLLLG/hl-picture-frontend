import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController.ts'

// 一个状态就存储一类要共享的数据（存一类常量）
export const useLoginUserStores = defineStore('id', () => {
  // 定义用户的初始值
  const loginUser = ref<API.UserLoginRequest>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
    // setTimeout(() => {
    //   loginUser.value = {
    //     id: 1,
    //     username: '未知用户',
    //   }
    // }, 3000)
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, fetchLoginUser, setLoginUser }
})
