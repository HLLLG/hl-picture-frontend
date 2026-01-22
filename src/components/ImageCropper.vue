<template>
  <a-modal
    class="image-cropper"
    v-model:open="open"
    title="裁剪图片"
    :footer="null"
    @cancel="closeModal"
  >
    <!-- 图片裁剪组件 -->
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      outputType="png"
      :can-move-box="true"
      :auto-crop="true"
      :center-box="true"
      :info="true"
      :fixedBox="false"
    ></vue-cropper>
    <div style="margin-bottom: 16px"></div>
    <!-- 操作按钮 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft">向左旋转</a-button>
        <a-button @click="rotateRight">向右旋转</a-button>
        <a-button @click="changeScale(1)">放大</a-button>
        <a-button @click="changeScale(-1)">缩小</a-button>
        <a-button type="primary" @click="handleConfirm">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: number
}
const props = defineProps<Props>()

// 编辑器组建的引用
const cropperRef = ref()
// 改变图片大小
const changeScale = (num) => {
  num = num || 1
  cropperRef.value?.changeScale(num)
}
// 向左旋转
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
}
// 向右旋转
const rotateRight = () => {
  cropperRef.value?.rotateRight()
}

// 上传裁剪后的图片
const handleConfirm = () => {
  cropperRef.value?.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    // 创建一个文件对象
    const file = new File([blob], fileName, { type: blob.type })
    // 调用上传函数
    handleUpload({ file })
  })
}

const loading = ref<boolean>(false)
/**
 * 上传图片
 *
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭裁剪组件
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败，' + error.message)
    console.error('图片上传失败，' + error)
  }
  loading.value = false
}

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

// 暴露给父组件
defineExpose({
  openModal,
})
</script>

<style>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px !important;
}
</style>
