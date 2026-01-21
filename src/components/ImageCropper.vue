<template>
  <div id="image-cropper">
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
      <a-button @click="rotateLeft">向左旋转</a-button>
      <a-button @click="rotateRight">向右旋转</a-button>
      <a-button @click="changeScale(1)">放大</a-button>
      <a-button @click="changeScale(-1)">缩小</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  imageUrl: string
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

// const finish = (type) => {
//   // 输出
//   // var test = window.open('about:blank')
//   // test.document.body.innerHTML = '图片生成中..'
//   if (type === 'blob') {
//     this.$refs.cropper.getCropBlob((data) => {
//       console.log(data)
//       var img = window.URL.createObjectURL(data)
//       this.model = true
//       this.modelSrc = img
//     })
//   } else {
//     this.$refs.cropper.getCropData((data) => {
//       this.model = true
//       this.modelSrc = data
//     })
//   }
// }
</script>

<style scoped>
#image-cropper {
  text-align: center;
}

#image-cropper .vue-cropper {
  height: 400px;
}
</style>
