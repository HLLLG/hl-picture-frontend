<template>
  <div id="search-picture-page">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin-bottom: 16px">原图</h3>
    <a-card style="width: 240px">
      <!-- 单张图片 -->
      <template #cover>
        <a-image
          style="height: 180px; object-fit: cover"
          :alt="picture.name"
          :src="picture.thumbnailUrl ?? picture.url"
        />
      </template>
    </a-card>
    <h3 style="margin: 16px 0">识图结果</h3>
    <!-- 图片结果列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <a :href="item.fromUrl" target="_blank">
            <a-card>
              <!-- 单张图片 -->
              <template #cover>
                <a-image :src="item.thumbUrl" style="height: 180px; object-fit: cover" />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getPictureVoByIdUsingPost,
  searchPictureByPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pictureId = computed(() => {
  return route.query?.pictureId
})

// ---------------------获取图片数据---------------------------
// 图片数据列表
const dataList = ref<API.ImageSearchResult[]>([])

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({ pictureId: pictureId.value })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败，' + error)
  }
  loading.value = false
}

const picture = ref<API.PictureVO>({})

// 获取旧的图片信息
const getOldPicture = async () => {
  const id = route.query?.pictureId
  if (id) {
    const res = await getPictureVoByIdUsingPost({
      id: id,
    })
    if (res.data.code === 0 || res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}

// 页面请求的时候加载一次
onMounted(() => {
  getOldPicture()
  fetchData()
})
</script>

<style scoped>
#search-picture-page {
  margin-bottom: 16px;
}
</style>
