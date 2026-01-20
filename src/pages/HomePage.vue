<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 颜色选择器 -->
    <a-space class="color-row">
      <a-form-item class="color-row__item" label="按颜色搜索">
        <color-picker format="hex" v-model:pureColor="searchParams.picColor" />
      </a-form-item>
      <a-button html-type="reset" @click="doClear">重置</a-button>
    </a-space>

    <!-- 分类和标签 -->
    <a-tabs v-model:activeKey="selectCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部"></a-tab-pane>
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category"></a-tab-pane>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签:</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 展示图片组件 -->
    <PictureList :dataList="dataList" :loading="loading" :onReload="fetchData" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'
import { ColorPicker } from 'vue3-colorpicker'

// 图片数据列表
const dataList = ref<API.PictureVO[]>([])
// 图片数
const total = ref(0)
const loading = ref(true)

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 获取图片数据
const fetchData = async () => {
  loading.value = true
  const params = {
    ...searchParams,
    tags: [],
  }
  if (selectCategory.value !== 'all') {
    params.category = selectCategory.value
  }
  selectTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败' + res.data.message)
  }
  loading.value = false
}

// 搜索
const doSearch = async () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const selectCategory = ref<string>()
const tagList = ref<string[]>([])
const selectTagList = ref<boolean[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList
    categoryList.value = res.data.data.categoryList
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

// 页面请求的时候加载一次
onMounted(() => {
  fetchData()
  getTagCategoryOptions()
})

// 重置搜索条件
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  // 重置页码
  searchParams.current = 1
  searchParams.pageSize = 12
  searchParams.sortField = 'createTime'
  searchParams.sortOrder = 'descend'
  selectCategory.value = 'all'
  selectTagList.value = []
  fetchData()
}
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar {
  margin-bottom: 16px;
}

.color-row {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中（子项在这一行内居中） */
}

/* 消除 a-form-item 默认的 margin，避免把按钮挤到下一行 */
.color-row__item {
  margin-bottom: 0;
}
</style>
