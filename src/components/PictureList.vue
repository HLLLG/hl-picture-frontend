<template>
  <div id="homePage">
    <div class="search-bar">
      <!-- 搜索框 -->
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
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
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a-card hoverable>
            <!-- 单张图片 -->
            <template #cover>
              <img
                :src="picture.thumbnailUrl ?? picture.url"
                :alt="picture.name"
                style="height: 180px; object-fit: cover"
                @click="doClickPicture(picture)"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

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

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    onChange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

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
    message.error('获取数据失败' + res.data.data.message)
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

const router = useRouter()

const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 页面请求的时候加载一次
onMounted(() => {
  fetchData()
  getTagCategoryOptions()
})
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
</style>
