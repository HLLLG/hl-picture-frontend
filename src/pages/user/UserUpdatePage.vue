<template>
  <div id="userUpdatePage">
    <div class="title">
      <h1>个人资料</h1>
    </div>
    <!-- 表单 -->
    <a-form :model="userVO" class="form">
      <a-form-item label="头像">
        <a-input
          v-if="editableData[loginUser.id]"
          v-model:value="editableData[loginUser.id]['userAvatar']"
        />
        <div v-else>
          <a-image :src="loginUser.userAvatar" width="80px" height="100px"></a-image>
        </div>
      </a-form-item>
      <a-form-item label="用户名">
        <a-input
          v-if="editableData[loginUser.id]"
          v-model:value="editableData[loginUser.id]['userName']"
        />
        <div v-else>{{ loginUser.userName }}</div>
      </a-form-item>

      <a-form-item label="账号">
        <a-input
          v-if="editableData[loginUser.id]"
          v-model:value="editableData[loginUser.id]['userAccount']"
        />
        <div v-else>{{ loginUser.userAccount }}</div>
      </a-form-item>

      <a-form-item label="简介">
        <a-textarea
          v-if="editableData[loginUser.id]"
          v-model:value="editableData[loginUser.id]['userProfile']"
        />
        <div v-else>{{ loginUser.userProfile }}</div>
      </a-form-item>

      <a-form-item label="用户角色">
        <div>
          <div v-if="loginUser.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="id">
        <div>{{ loginUser.id }}</div>
      </a-form-item>

      <a-form-item label="创建时间">
        <div>
          {{ dayjs(loginUser.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </a-form-item>

      <a-form-item>
        <div class="editAction">
          <span v-if="editableData[loginUser.id]" class="editActionBtn">
            <a-typography-link @click="save(loginUser.id)">保存</a-typography-link>
            <a-popconfirm
              title="是否取消修改?"
              ok-text="是"
              cancel-text="否"
              @confirm="cancel(loginUser.id)"
            >
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a-button @click="edit(loginUser.id)" class="custom-button">
              <EditOutlined />
              编辑
            </a-button>
          </span>
          <a-button @click="rollBack()" class="custom-button">
            <RollbackOutlined />
            返回
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, type UnwrapRef } from 'vue'
import { updateUserUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'
import { EditOutlined, RollbackOutlined } from '@ant-design/icons-vue'

const userVO = reactive<API.UserVO>({})
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

const editableData: UnwrapRef<Record<string, API.UserVO>> = reactive({})

const edit = (id: string) => {
  editableData[id] = cloneDeep(loginUser)
}

const rollBack = () => {
  window.history.length > 1 ? window.history.back() : (window.location.href = '/')
}

const save = async (id: string) => {
  Object.assign(loginUser, editableData[id])
  const updateRequest: API.UserUpdateRequest = {
    ...editableData[id],
  }
  const res = await updateUserUsingPost(updateRequest)
  if (res.data.code === 0) {
    message.success('保存成功')
  } else {
    message.error('保存失败，' + res.data.message)
  }
  delete editableData[id]
}

const cancel = (id: string) => {
  delete editableData[id]
}
</script>

<style scoped>
#userUpdatePage {
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f4f4f4;
  min-height: 100vh;
}

.title {
  text-align: center;
  margin-bottom: 30px; /* 增加标题和内容之间的间距 */
}

.form {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 600px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.editAction {
  display: flex;
  gap: 10px;
}

.editActionBtn {
  display: flex;
  gap: 10px;
}

:deep(.ant-form-item-label) {
  font-weight: bold; /* 加粗文本 */
  color: #333; /* 更改文本颜色 */
  width: 100px;
  text-align: left;
}

.custom-button {
  background-color: #f0f8ff; /* 设置背景色 */
  border-color: #f0f8ff; /* 设置边框色 */
  color: black; /* 设置文字颜色 */
}

.custom-button:hover {
  background-color: #89cff0; /* 悬停时的背景色 */
  border-color: #89cff0; /* 悬停时的边框色 */
}
</style>
