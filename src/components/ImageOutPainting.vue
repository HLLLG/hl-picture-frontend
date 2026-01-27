<template>
  <a-modal
    class="image-out-painting"
    v-model:open="open"
    title="AI 扩图"
    :footer="null"
    @cancel="closeModal"
    style="width: 1024px; height: 1024px"
  >
    <a-row :gutter="16">
      <a-col :span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col :span="12">
        <h4>扩图结果</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <div style="margin-bottom: 8px"></div>
    <!-- 操作按钮 -->
    <a-space size="middle">
      <a-button :loading="!!taskId" type="primary" ghost @click="createTask">生成图片</a-button>
      <a-button :loading="loading" v-if="resultImageUrl" type="primary" @click="handleUpload"
        >应用结果</a-button
      >
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: number
}
const props = defineProps<Props>()

const loading = ref<boolean>(false)
const resultImageUrl = ref<string>('')
const taskId = ref<number | null>(null)

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

/**
 * 根据url上传图片
 *
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = {
      id: props.picture?.id,
      spaceId: props.spaceId!,
      fileUrl: resultImageUrl.value,
    }
    const res = await uploadPictureByUrlUsingPost(params, {})
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败，' + error)
    console.error('图片上传失败，' + error)
  } finally {
    loading.value = false
  }
}

/**
 * 创建扩图任务
 */
const createTask = async () => {
  try {
    const res = await createPictureOutPaintingTaskUsingPost({
      pictureId: props.picture?.id,
      // 其他参数可以根据需要添加
      parameters: {
        xScale: 2,
        yScale: 2,
      },
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('创建任务成功，请耐心等待，不要退出界面')
      taskId.value = res.data.data.output.taskId
      // 轮询任务状态，获取生成的图片URL
      startPolling()
    } else {
      message.error('创建任务失败，' + res.data.message)
    }
  } catch (error) {
    message.error('创建任务失败，' + error.message)
    console.error('创建任务失败，' + error)
  }
}

// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 开始轮询任务状态
const startPolling = () => {
  if (!taskId.value) {
    return
  }
  // 每隔3秒轮询一次
  pollingTimer = setInterval(async () => {
    const res = await getPictureOutPaintingTaskUsingGet({
      taskId: taskId.value,
    })
    try {
      if (res.data.code === 0 && res.data.data) {
        const taskStatus = res.data.data.output.taskStatus
        if (taskStatus === 'SUCCEEDED') {
          // 任务完成，获取生成的图片URL
          resultImageUrl.value = res.data.data.output.outputImageUrl
          message.success('扩图任务成功')
          // 清理轮询定时器
          clearPolling()
        } else if (taskStatus === 'FAILED') {
          message.error('扩图任务失败，' + res.data.data.output.message)
          // 清理轮询定时器
          clearPolling()
        }
      }
    } catch (error) {
      message.error('轮询获取任务状态失败，' + error)
      console.error('检测任务状态失败，请稍后重试')
      clearPolling()
    }
  }, 3000)
}

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 暴露给父组件
defineExpose({
  openModal,
})
</script>

<style>
.image-out-painting {
  text-align: center;
}
</style>
