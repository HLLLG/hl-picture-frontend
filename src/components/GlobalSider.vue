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
import { computed, h, ref, watch, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { type MenuProps, message } from 'ant-design-vue'
import { SPACE_TYPE_ENUM } from '@/constants/Space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'

const loginUserStore = useLoginUserStore()

// 固定菜单项
const fixMenuItems = [
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
  {
    key: `/add_space?type=${SPACE_TYPE_ENUM.TEAM}`,
    icon: () => h(TeamOutlined),
    label: '创建团队',
  },
]
// 团队空间菜单项
const teamSpaceList = ref<API.SpaceUserVO[]>([])

const fetchTeamSpacesList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

watchEffect(() => {
  // 登录用户存在时，加载团队空间列表
  if (loginUserStore.loginUser.id) {
    fetchTeamSpacesList()
  }
})

const menuItems = computed(() => {
  // 没有团队空间，只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixMenuItems
  }

  // 有团队空间，展示团队空间菜单
  const teamSpaceMenuItems: MenuProps['items'] = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    key: 'teamSpace',
    label: '团队空间',
    children: teamSpaceMenuItems,
    type: 'group',
  }
  return [...fixMenuItems, teamSpaceMenuGroup]
})

const router = useRouter()
const route = useRoute()

const getMenuKeyByPath = (fullPath: string) => {
  // 提取路径部分（不含查询参数）
  const path = fullPath.split('?')[0]

  // 检查是否为空间路径
  if (path.startsWith('/space/')) {
    const spaceId = path.split('/')[2]
    // 如果在团队空间列表中，返回团队空间的 key（不带查询参数）
    const isTeamSpace = teamSpaceList.value.some(
      (spaceUser) => String(spaceUser.spaceId) === spaceId,
    )
    if (isTeamSpace) return `/space/${spaceId}`
    // 否则是私有空间，高亮 /my_space
    return '/my_space'
  }

  // 创建团队需要完整路径匹配（带查询参数）
  if (path === '/add_space') {
    return fullPath
  }

  return path
}

const current = ref<string[]>([])
// 监听路由变化，高亮菜单项
watch(
  () => route.fullPath,
  async (fullPath) => {
    await fetchTeamSpacesList()
    current.value = [getMenuKeyByPath(fullPath)]
  },
  { immediate: true },
)

//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
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
const items = computed<MenuProps['items']>(() => filterMenu(menuItems.value))
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: #fff;
}
</style>
