<template>
  <div id="addPictureBatchPage">
    <h1 style="margin-bottom: 16px">批量创建图片</h1>
    <a-form name="dataForm" layout="vertical" :model="dataForm" @finish="handleSubmit">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="dataForm.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item label="抓取数量" name="count">
        <a-input-number
          v-model:value="dataForm.count"
          placeholder="请输入数量"
          style="min-width: 180px"
          :min="1"
          :max="30"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="抓取偏移量" name="offset">
        <a-input-number
          v-model:value="dataForm.offset"
          placeholder="请输入抓取偏移量"
          style="min-width: 180px"
          :min="0"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="名称前缀" name="namePrefix">
        <a-input
          v-model:value="dataForm.namePrefix"
          placeholder="请输入名称前缀，自动填充序号"
          allow-clear
        ></a-input>
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="dataForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allow-clear
        ></a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="dataForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >执行任务</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  uploadPictureByBatchUsingPost,
} from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'

const dataForm = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
  offset: 0,
})
const router = useRouter()
const loading = ref(false)

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...dataForm,
  })
  // 操作成功
  if (res.data.code === 0 || res.data.data) {
    message.success(`批量创建成功，共 ${res.data.data} 条`)
    // 返回主页
    router.push('/')
  } else {
    message.error('批量创建成功，' + res.data.message)
  }
  loading.value = false
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

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
