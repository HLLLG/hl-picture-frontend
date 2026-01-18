<template>
  <div class="batch-edit-picture-modal">
    <a-modal
      destroyOnClose
      v-model:open="open"
      title="批量编辑"
      :footer="null"
      @cancel="closeModal"
    >
      <a-typography-paragraph type="secondary"> * 只对当前页面的图片生效 </a-typography-paragraph>
      <!-- 图片信息表单 -->
      <a-form name="dataForm" layout="vertical" :model="dataForm" @finish="handleSubmit">
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
        <a-form-item label="命名规则" name="nameRule">
          <a-input
            v-model:value="dataForm.nameRule"
            placeholder="请输入命名规则，输入{序号}可动态生成"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureByBatchUsingPost,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'

interface Props {
  spaceId?: number
  pictureList?: API.PictureVO[]
  onSuccess?: () => void
}
const props = withDefaults(defineProps<Props>(), {})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const resetForm = () => {
  dataForm.category = ''
  dataForm.tags = []
  dataForm.nameRule = ''
}

const closeModal = () => {
  resetForm()
  open.value = false
}

const dataForm = reactive<API.PictureEditByBatchRequest>({
  category: '',
  tags: [],
  nameRule: '',
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!props.pictureList) {
    return
  }
  const res = await editPictureByBatchUsingPost({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...dataForm,
  })
  // 操作成功
  if (res.data.code === 0 || res.data.data) {
    message.success('操作成功')
    // 回调父组件刷新数据
    closeModal()
    props.onSuccess?.()
  } else {
    message.error('操作失败，' + res.data.message)
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

onMounted(() => {
  getTagCategoryOptions()
})

// 暴露给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.batch-edit-picture-modal {
  margin-bottom: 8px;
}
</style>
