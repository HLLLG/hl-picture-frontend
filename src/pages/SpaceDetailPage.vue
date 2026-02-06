<template>
  <div id="space-detail-page">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <a-space align="baseline">
        <div v-if="space.spaceLevel === SPACE_LEVEL_ENUM.FLAGSHIP" class="flagship-icon">💎</div>
        <h2>{{ space.spaceName }} ({{ SPACE_TYPE_MAP[space.spaceType] }})</h2>
      </a-space>
      <a-space size="middle">
        <a-button v-if="canUploadPicture" type="primary" @click="showModal">+ 创建图片</a-button>
        <a-modal v-model:open="open" width="50%" destroyOnClose :footer="null">
          <AddPicturePage :spaceId="props.id" />
        </a-modal>
        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${props.id}`"
          ghost
          >成员管理</a-button
        >
        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${props.id}`"
          ghost
          >空间分析</a-button
        >
        <a-tooltip placement="topRight">
          <template #title
            >占用空间：{{ formatSize(space.totalSize) }} / {{ formatSize(space.maxSize) }}</template
          >
          <a-progress
            type="circle"
            :percent="(((space.totalSize ?? 0) * 100) / (space.maxSize || 1)).toFixed(2)"
            :size="48"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!-- 图片搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />
    <a-tabs v-model:activeKey="showType">
      <a-tab-pane key="list" tab="列表">
        <!-- 展示图片组件 -->
        <PictureList
          :dataList="dataList"
          :loading="loading"
          :showOp="true"
          :onReload="fetchData"
          :spaceId="props.id"
          :canEdit="canEditPicture"
          :canDelete="canDeletePicture"
        />
      </a-tab-pane>
      <a-tab-pane key="table" tab="表格" force-render>
        <!-- 展示图片表格组件 -->
        <PictureTable
          :dataList="dataList"
          :loading="loading"
          :showOp="true"
          :onReload="fetchData"
          :spaceId="props.id"
          :canEdit="canEditPicture"
          :canDelete="canDeletePicture"
        />
      </a-tab-pane>
    </a-tabs>
    <!-- 分页参数 -->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import { formatSize } from '@/utils'
import { SPACE_LEVEL_ENUM, SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '@/constants/Space.ts'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import 'vue3-colorpicker/style.css'
import { BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import PictureTable from '@/components/PictureTable.vue'
import { useRoute } from 'vue-router'

interface Props {
  id: number
}
const props = defineProps<Props>()

const showType = ref<string>('list')

const open = ref<boolean>(false)

const showModal = () => {
  open.value = true
}

// ---------------------获取空间数据---------------------------
const space = ref<API.SpaceVO>({})

const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error: any) {
    console.error('获取空间详情失败，', error)
  }
}

// ---------------------获取图片数据---------------------------
// 图片数据列表
const dataList = ref<API.PictureVO[]>([])
// 图片数
const total = ref(0)
const loading = ref(true)

const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  const params = {
    ...searchParams.value,
    spaceId: props.id,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 搜索数据
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  // 合并搜索参数
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

// 监听 spaceId 变化，重新加载数据
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      fetchSpaceDetail()
      fetchData()
    }
  },
  { immediate: true },
)

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
</script>

<style scoped>
#space-detail-page {
  margin-bottom: 16px;
}

.flagship-icon {
  font-size: 24px;
  line-height: 1;
}
</style>
