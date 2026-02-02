<template>
  <div id="addPicturePage">
    <a-space>
      <a-button type="text" :icon="h(ArrowLeftOutlined)" @click="doRollBack"></a-button>
      <h2 class="title-bar">
        {{ route.query?.id ? '修改图片' : '创建图片' }}
      </h2>
    </a-space>
    <!-- 空间信息和使用进度 -->
    <a-space v-if="spaceId" size="middle">
      <a-typography-paragraph type="secondary" style="margin: 0">
        上传至空间：<a :href="`/space/${props.spaceId}`" target="_blank">{{ props.spaceId }}</a>
      </a-typography-paragraph>
      <a-tooltip placement="topRight">
        <template #title
          >目前占用空间：{{ formatSize(space.totalSize) }} /
          {{ formatSize(space.maxSize) }}</template
        >
        <a-progress
          type="circle"
          :percent="((space.totalSize * 100) / space.maxSize).toFixed(2)"
          :size="48"
        />
      </a-tooltip>
    </a-space>
    <!-- 选择上传方式   -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :onSuccess="onSuccess" :spaceId="props.spaceId" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL 上传" force-render>
        <UrlPictureUpload :picture="picture" :onSuccess="onSuccess" :spaceId="props.spaceId" />
      </a-tab-pane>
    </a-tabs>
    <!-- 图片编辑功能栏 -->
    <div class="edit-bar">
      <a-space size="middle">
        <a-button
          :icon="h(EditOutlined)"
          @click="doCropPicture"
          v-if="picture"
          style="margin: 8px 0"
          >裁剪图片</a-button
        >
        <a-button
          type="primary"
          ghost
          :icon="h(FullscreenOutlined)"
          @click="doImagePainting"
          v-if="picture"
          style="margin: 8px 0"
          >AI 扩图</a-button
        >
      </a-space>

      <!-- 图片裁剪组件 -->
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <!-- AI 扩图组件 -->
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onOutPaintingSuccess"
      />
    </div>
    <!-- 图片信息表单 -->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="name">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allow-clear
        ></a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { formatSize } from '@/utils'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import ImageCropper from '@/components/ImageCropper.vue'
import { ArrowLeftOutlined, EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'

interface Props {
  spaceId?: number
}
const props = defineProps<Props>()

const router = useRouter()
const picture = ref<API.PictureVO>()
const uploadType = ref<'file' | 'url'>('file')
const route = useRoute()

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const pictureForm = reactive<API.PictureEditRequest>({})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 || res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

// 获取旧的图片信息
const getOldPicture = async () => {
  const pictureId = route.query?.id
  const res = await getPictureVoByIdUsingGet({
    id: pictureId,
  })
  if (res.data.code === 0 || res.data.data) {
    const data = res.data.data
    picture.value = data
    pictureForm.name = data.name
    pictureForm.category = data.category
    pictureForm.tags = data.tags
    pictureForm.introduction = data.introduction
  }
}

// 获取空间信息
const space = ref<API.SpaceVO>({})

const getOldSpace = async () => {
  if (!props.spaceId) {
    return
  }
  const res = await getSpaceVoByIdUsingGet({ id: props.spaceId })
  if (res.data.code === 0 && res.data.data) {
    space.value = res.data.data
  } else {
    message.error('获取空间信息失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
  getOldPicture()
  getOldSpace()
})

// 返回上个页面
const doRollBack = () => {
  router.back()
}

// ------------------- 图片裁剪相关 -------------------
const imageCropperRef = ref()
/**
 * 打开图片裁剪组件
 */
const doCropPicture = () => {
  if (!picture.value) {
    message.warning('请先上传图片')
    return
  }
  imageCropperRef.value?.openModal()
}
/**
 * 图片裁剪上传成功
 * @param newPicture
 */
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// ------------------- AI 扩图相关 -------------------
const imageOutPaintingRef = ref()
/**
 * 打开图片裁剪组件
 */
const doImagePainting = () => {
  if (!picture.value) {
    message.warning('请先上传图片')
    return
  }
  imageOutPaintingRef.value?.openModal()
}
/**
 * 图片裁剪上传成功
 * @param newPicture
 */
const onOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
</script>

<style scoped>
#addPicturePage {
  max-width: 720px;
  margin: 0 auto;
}
.edit-bar {
  text-align: center;
}

.title-bar {
  display: flex;
  align-items: center; /* 垂直居中，从而“水平一行对齐” */
  gap: 12px; /* 间距可按需调整 */
  margin-bottom: 3px;
}
</style>
