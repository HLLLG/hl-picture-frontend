<template>
  <div class="urlPictureUpload">
    <a-input-group compact>
      <a-input
        v-model:value="fileUrl"
        placeholder="请输入图片url地址"
        style="width: calc(100% - 120px)"
      />
      <a-button type="primary" :loading="loading" @click="handleUploadByUrl" style="width: 120px"
        >上传</a-button
      >
    </a-input-group>
    <div class="img-wrapper">
      <a-image v-if="picture?.url" :src="picture?.url" alt="avatar"></a-image>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: number
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
    params.spaceId = props.spaceId
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
.urlPictureUpload {
  margin-bottom: 16px;
}

.urlPictureUpload :deep(.ant-image-img) {
  max-width: 100%;
  max-height: 480px;
  margin-left: 0;
  margin-right: 0;
}

.urlPictureUpload .img-wrapper {
  text-align: center;
  margin-top: 16px;
}
</style>
