<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      breakpoint="lg"
      collapsed-width="0"
      width="200"
    >
      <a-menu v-model:selectedKeys="current" :items="items" mode="inline" @click="doMenuClick">
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, watch } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import type { MenuProps } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()

const originMenu = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
  },
]

const router = useRouter()
const route = useRoute()

const getMenuKeyByPath = (path: string) => {
  // MySpacePage 会重定向到 /space/:id，但侧边菜单仍高亮 /my_space
  if (path.startsWith('/space/')) return '/my_space'
  return path
}

const current = ref<string[]>([])
// 监听路由变化，高亮菜单项
watch(
  () => route.path,
  (path) => {
    current.value = [getMenuKeyByPath(path)]
  },
  { immediate: true },
)

//路由跳转事件
const doMenuClick: MenuProps['onClick'] = ({ key }) => {
  router.push({
    path: key as string,
  })
}

// 过滤菜单
const filterMenu = (menus: MenuProps['items'] = []) =>
  menus?.filter((menu) => {
    const key = String(menu?.key ?? '')
    if (key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') return false
    }
    return true
  })

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenu(originMenu))
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: #fff;
}
</style>
