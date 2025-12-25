<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image style="max-height: 600px; object-fit: contain" :src="picture.url" />
        </a-card>
      </a-col>
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.userVO?.userAvatar" />
                <div>{{ picture.userVO?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
          <a-space wrap>
            <a-button type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button v-if="canEdit" :icon="h(EditOutlined)" type="default" @click="doEdit"
              >编辑</a-button
            >
            <a-button v-if="canEdit" :icon="h(DeleteOutlined)" danger @click="doDelete"
              >删除</a-button
            >
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { deletePictureUsingPost, getPictureVoByIdUsingPost } from '@/api/pictureController.ts'
import { computed, h, onMounted, ref } from 'vue'
import { downloadImage, formatSize } from '@/utils'
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { useRouter } from 'vue-router'

interface Props {
  id: string
}
const props = defineProps<Props>()

const picture = ref<API.PictureVO>({})

// 获取图片数据
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingPost({
      id: props.id,
    })
    if (res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败' + res.data.message)
    }
  } catch (error: any) {
    console.error('获取图片详情失败', error)
  }
}

// 删除图片
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

const loginUserStore = useLoginUserStore()

// 判断用户是否有权限编辑和删除
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  // 未登录不可编辑
  if (!loginUser) {
    return false
  }
  // 仅本人或管理员可编辑
  return loginUser.id === picture.value.userVO?.id || loginUser.id === 'admin'
})

// 跳转到编辑页面
const router = useRouter()
const doEdit = () => {
  router.push({
    path: '/add_picture?id=',
    query: {
      id: picture.value.id,
    },
  })
}

// 图片下载
const doDownload = () => {
  downloadImage(picture.value.url)
}

onMounted(() => {
  fetchPictureDetail()
})
</script>

<style scoped>
#PictureDetailPage {
  margin-bottom: 16px;
}
</style>
