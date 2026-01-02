<template>
  <div id="pictureManagePage">
    <!-- 管理员上传方式选择  -->
    <a-flex justify="space-between">
      <h2>图片上传</h2>
      <a-space>
        <a-button type="primary" href="/add_picture" target="_blank">创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost
          >批量创建图片</a-button
        >
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          mode="tags"
          v-model:value="searchParams.tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="reviewStatus" label="审核状态">
        <a-select
          v-model:value="searchParams.reviewStatus"
          placeholder="请选择审核状态"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px"></div>
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="80" :height="100" />
        </template>
        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-else-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核人：{{ record.reviewerId }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >通过</a-button
            >
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              @click="showRejectModal(record)"
              danger
              >拒绝</a-button
            >
            <a-modal
              v-model:open="open"
              title="拒绝原因"
              @ok="doReject(PIC_REVIEW_STATUS_ENUM.REJECT)"
            >
              <a-input
                v-model:value="rejectReviewMessage"
                placeholder="请输入拒绝原因，默认管理员操作拒绝"
              ></a-input>
            </a-modal>
            <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
              >编辑</a-button
            >
            <a-popconfirm
              title="是否删除"
              ok-text="是"
              cancel-text="否"
              @confirm="confirm(record.id)"
              @cancel="cancel"
            >
              <a-button danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUserUsingPost } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController.ts'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/Picture.ts'

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

// 图片数据列表
const dataList = ref<API.Picture[]>([])
// 图片数
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 页面切换后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取图片数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败' + res.data.data.message)
  }
}

// 页面请求的时候加载一次
onMounted(() => {
  fetchData()
})

// 搜索数据
const doSearch = (values: any) => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}
// 删除图片
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  // 管理员自动通过
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : record.reviewMessage
  const params = {
    id: record.id,
    reviewStatus: reviewStatus,
    reviewMessage: reviewMessage,
  }
  const res = await doPictureReviewUsingPost(params)
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}
// 拒绝时可填写信息
const open = ref<boolean>(false)
const rejectReviewMessage = ref<string>('')
const currentRecord = ref<API.Picture>({})
const showRejectModal = (record: API.Picture) => {
  currentRecord.value = record
  rejectReviewMessage.value = '管理员操作拒绝'
  open.value = true
}

const doReject = async (reviewStatus: number) => {
  if (rejectReviewMessage.value === '' || !reviewStatus) {
    rejectReviewMessage.value = '管理员操作拒绝'
  }
  await handleReview(
    { ...currentRecord.value, reviewMessage: rejectReviewMessage.value },
    reviewStatus,
  )
  open.value = false
}

// 删除确认
const confirm = async (id: string) => {
  await doDelete(id)
}
// 删除取消
const cancel = (e: MouseEvent) => {
  message.error('取消删除')
}
</script>

<style scoped></style>
