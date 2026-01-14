<template>
  <div id="homePage">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="props.dataList"
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
            <template v-if="showOp" #actions>
              <a-space @click="(e) => doSearch(e, picture)">
                <SearchOutlined />
                搜索
              </a-space>
              <a-space @click="(e) => doEdit(e, picture)">
                <EditOutlined />
                编辑
              </a-space>
              <a-space @click="(e) => doDelete(e, picture)">
                <DeleteOutlined />
                删除
              </a-space>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost } from '@/api/pictureController.ts'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
}
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
})

const router = useRouter()

const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 编辑图片
const doEdit = (e: Event, picture: API.PictureVO) => {
  // 阻止事件冒泡
  e.stopPropagation()
  // 跳转时携带spaceId
  router.push({
    path: `/add_picture?id=`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
// 删除图片
const doDelete = async (e: Event, picture: API.PictureVO) => {
  // 阻止事件冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新页面
    props.onReload?.()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 以图搜图
const doSearch = (e: Event, picture: API.PictureVO) => {
  // 阻止事件冒泡
  e.stopPropagation()
  // 打开新页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}
</script>

<style scoped></style>
