<template>
  <div class="urlpictureUpload">
    <a-input-group compact>
      <a-input
        v-model:value="fileUrl"
        placeholder="请输入图片url地址"
        style="width: calc(100% - 200px)"
      />
      <a-button type="primary" :loading="loading" @click="handleUploadByUrl" style="width: 120px"
        >上传</a-button
      >
    </a-input-group>
    <a-image v-if="picture?.url" :src="picture?.url" alt="avatar"></a-image>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

const loading = ref<boolean>(false)

const fileUrl = ref<string>('')

/**
 * 上传URL图片
 */
const handleUploadByUrl = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = {
      id: props.picture?.id,
      fileUrl: fileUrl.value,
    }
    const res = await uploadPictureByUrlUsingPost(params, {})
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
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
</script>

<style scoped>
.pictureUpload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.pictureUpload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
