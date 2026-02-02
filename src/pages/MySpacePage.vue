<template>
  <div id="mySpacePage">
    <p>正在跳转中，请稍后...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useRouter } from 'vue-router'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { SPACE_TYPE_ENUM } from '@/constants/Space.ts'

const loginUserStore = useLoginUserStore()
const router = useRouter()

// 检查用户是否有个人空间
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  // 若未登录，跳转到登录页面
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  } else {
    // 根据用户id查询用户空间
    const res = await listSpaceVoByPageUsingPost({
      current: 1,
      pageSize: 1,
      userId: loginUser.id,
      spaceType: SPACE_TYPE_ENUM.PRIVATE,
    })
    if (res.data.code === 0 && res.data.data) {
      if (res.data.data?.records?.length > 0) {
        // 若存在个人空间，跳转到个人空间详情页
        const space = res.data.data.records[0]
        router.replace(`/space/${space.id}`)
      } else {
        message.warn('请先创建空间')
        router.push('/add_space')
      }
    } else {
      message.error('获取空间失败 ' + res.data.message)
    }
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>

<style scoped></style>
