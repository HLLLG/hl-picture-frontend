<template>
  <div class="picture-search-form">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="searchParams.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          style="min-width: 180px"
          allow-clear
        ></a-auto-complete>
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          style="min-width: 180px"
          allow-clear
        ></a-select>
      </a-form-item>
      <!-- 更多搜索项折叠面板 -->
      <a-collapse class="search-collapse" v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="more" header="更多搜索项">
          <div class="more-fields">
            <a-form-item label="日期">
              <a-range-picker
                style="width: 400px"
                show-time
                format="YYYY/MM/DD HH:mm:ss"
                v-model:value="dateRange"
                :placeholder="['编辑开始日期', '编辑结束日期']"
                :presets="rangePresets"
                @change="onRangeChange"
              />
            </a-form-item>
            <a-form-item label="名称">
              <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
            </a-form-item>
            <a-form-item label="简介">
              <a-input
                v-model:value="searchParams.introduction"
                placeholder="请输入简介"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="图片尺寸" name="imgSize">
              <a-select
                v-model:value="searchParams.imgSize"
                placeholder="请选择图片尺寸"
                :options="IMG_SIZE_OPTIONS"
                style="min-width: 90px"
                allow-clear
              ></a-select>
            </a-form-item>
            <a-form-item label="格式">
              <a-auto-complete
                v-model:value="searchParams.picFormat"
                placeholder="请选择图片格式"
                :options="ImgFormatOptions"
                style="min-width: 90px"
                allow-clear
              ></a-auto-complete>
            </a-form-item>
            <!-- 颜色选择器 -->
            <a-form-item label="按颜色搜索">
              <color-picker format="hex" v-model:pureColor="searchParams.picColor" />
            </a-form-item>
          </div>
        </a-collapse-panel>
      </a-collapse>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" style="width: 96px">搜索</a-button>
          <a-button html-type="reset" @click="doClear">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { IMG_SIZE_OPTIONS } from '@/constants/ImgSize.ts'
import { ImgFormatOptions } from '@/constants/ImgFormat.ts'
import { ColorPicker } from 'vue3-colorpicker'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

const activeKey = ref<[]>([])

const dateRange = ref<[]>([])
// 监听日期范围变化
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates && dates[0] && dates[1]) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}
// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

// 执行搜索
const doSearch = () => {
  props.onSearch?.(searchParams)
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

// 重置搜索条件
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  // 日期范围单独处理，必须为空数组
  dateRange.value = []
  doSearch()
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
.picture-search-form .ant-form-item {
  margin-bottom: 16px;
}

.search-collapse {
  width: 100%;
}

.more-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
