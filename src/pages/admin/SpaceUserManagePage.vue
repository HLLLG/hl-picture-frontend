<template>
  <div id="pictureManagePage">
    <a-space>
      <a-button type="text" :icon="h(ArrowLeftOutlined)" @click="doRollBack"></a-button>
      <h2 class="title-bar">空间成员管理</h2>
    </a-space>

    <div style="margin-bottom: 32px"></div>
    <!-- 添加成员表单 -->
    <a-form layout="inline" :model="formData" @finish="handleSubmit">
      <a-form-item name="userId" label="用户id">
        <a-input v-model:value="formData.userId" placeholder="请输入用户id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">添加用户</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px"></div>
    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userName'">
          <img
            :src="record.user.userAvatar"
            alt="avatar"
            style="width: 36px; height: 36px; border-radius: 50%; margin-right: 8px"
          />
          {{ record.user.userName }}
        </template>
        <template v-else-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
          ></a-select>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-popconfirm
              title="是否删除"
              ok-text="是"
              cancel-text="否"
              @confirm="confirm(record.id)"
              @cancel="cancel"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { SPACE_ROLE_OPTIONS } from '@/constants/Space.ts'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
} from '@/api/spaceUserController.ts'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

interface Props {
  id?: string
}
const props = defineProps<Props>()

const columns = [
  {
    title: '用户',
    dataIndex: 'userName',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

const router = useRouter()

const doRollBack = () => {
  router.back()
}

const formData = reactive<API.SpaceUserAddRequest>({})
// 添加成员
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    message.error('空间ID不存在，无法添加成员')
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData,
  })
  if (res.data.code === 0) {
    message.success('添加成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('添加失败，' + res.data.message)
  }
}

// 成员数据列表
const dataList = ref<API.SpaceUserVO[]>([])

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    message.error('空间ID不存在，无法获取成员数据')
    return
  }
  const res = await listSpaceUserUsingPost({
    spaceId,
  })
  if (res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败' + res.data.message)
  }
}

// 页面请求的时候加载一次
onMounted(() => {
  fetchData()
})

// 删除成员
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 删除确认
const confirm = async (id: string) => {
  await doDelete(id)
}
// 删除取消
const cancel = (e: MouseEvent) => {
  message.error('取消删除')
}

// 编辑空间角色
const editSpaceRole = async (value: string, record: API.SpaceUserVO) => {
  if (!record.id) {
    return
  }
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if (res.data.code === 0) {
    message.success('修改成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('修改失败，' + res.data.message)
  }
}
</script>

<style scoped>
.title-bar {
  display: flex;
  margin-bottom: 3px;
}
</style>
