<template>
  <div>
    <a-modal v-model:open="open" :title="title" :footer="null" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px"></div>
      <h4>手机扫码查看</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  title?: string
  link?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: 'https://github.com/HLLLG',
})

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
