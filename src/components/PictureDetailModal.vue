<template>
  <div class="picture-detail-modal">
    <a-modal v-model:open="open" width="80%" destroyOnClose :footer="null" @cancel="closeModal">
      <PictureDetailPage :id="currentPictureId" :onSuccess="onSuccess" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import PictureDetailPage from '@/pages/PictureDetailPage.vue'
import { ref } from 'vue'

interface Props {
  currentPictureId?: number
  onSuccess?: () => void
}
const props = defineProps<Props>()

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
  closeModal,
})
</script>

<style scoped></style>
