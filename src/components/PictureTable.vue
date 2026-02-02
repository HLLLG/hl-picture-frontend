<template>
  <div class="picture-table">
    <!-- 多选操作 -->
    <a-button v-if="canEdit" type="primary" :disabled="!hasSelected" @click="doBatchEdit">
      批量编辑
    </a-button>
    <span style="margin-left: 8px">
      <template v-if="hasSelected">
        {{ `已选中 ${state.selectedRowKeys.length} 条` }}
      </template>
    </span>
    <!-- 批量编辑模块 -->
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :pictureList="selectedPictureVOList"
      :onSuccess="onBatchEditPictureSuccess"
      :spaceId="props.spaceId"
    />
    <!-- 表格 -->
    <a-table
      :row-key="(record: API.PictureVO) => record.id as number"
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="80" :height="100" />
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in safeParseTags(record.tags)" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button v-if="canEdit" :icon="h(EditOutlined)" @click="doEdit(record)" target="_blank"
              >编辑</a-button
            >
            <a-popconfirm
              title="是否删除"
              ok-text="是"
              cancel-text="否"
              @confirm="confirm(record)"
              @cancel="cancel"
            >
              <a-button v-if="canDelete" :icon="h(DeleteOutlined)" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'
import { computed, h, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  spaceId?: number
  canEdit?: boolean
  canDelete?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canDelete: false,
  canEdit: false,
})

const router = useRouter()
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '空间id',
    dataIndex: 'spaceId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 编辑图片
const doEdit = (picture: API.PictureVO) => {
  // 跳转时携带spaceId
  router.push({
    path: `/add_picture?id=`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
// 删除图片
const doDelete = async (picture: API.PictureVO) => {
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新页面
    props.onReload?.()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 删除确认
const confirm = async (picture: API.PictureVO) => {
  await doDelete(picture)
}
// 删除取消
const cancel = (e: MouseEvent) => {
  message.warn('取消删除')
}

// -------------------多选相关------------------------
const state = reactive<{
  selectedRowKeys: number[]
  selectedPictures: API.Picture[]
}>({
  selectedRowKeys: [],
  selectedPictures: [],
})

const hasSelected = computed(() => state.selectedRowKeys.length > 0)

/**
 * rowSelection.onChange 签名是：
 * (selectedRowKeys, selectedRows) => void
 * 这里第二个参数 selectedRows 是整行 picture
 */
const onSelectChange = (selectedRowKeys: number[], selectedRows: API.Picture[]) => {
  state.selectedRowKeys = selectedRowKeys
  state.selectedPictures = selectedRows
}

// 将 API.Picture[] 转为 API.PictureVO[]
const selectedPictureVOList = computed<API.PictureVO[]>(() => {
  return state.selectedPictures.map((picture) => ({
    ...picture,
  })) as API.PictureVO[]
})

// ---------------------批量编辑图片---------------------------
const batchEditPictureModalRef = ref()
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}
// 批量编辑成功回调
const onBatchEditPictureSuccess = () => {
  // 清空选择
  state.selectedRowKeys = []
  state.selectedPictures = []
  props.onReload?.()
}

// -------------------------安全解析标签-------------------------
type TagValue = string

const safeParseTags = (tags: unknown): TagValue[] => {
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
  }
  if (tags == null) return []

  if (typeof tags !== 'string') return [String(tags)]

  const s = tags.trim()
  if (!s) return []

  try {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : []
  } catch {
    // 兜底：有些后端可能返回 "a,b,c"
    if (s.includes(',')) {
      return s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    }
    return []
  }
}
</script>

<style scoped>
.picture-table {
  margin-bottom: 16px;
}
</style>
