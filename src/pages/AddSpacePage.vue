<template>
  <div id="addSpacePage">
    <h1 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
    </h1>
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          placeholder="请输入标签"
          :options="SPACE_LEVEL_OPTIONS"
          @select="doSelect"
          allow-clear
        ></a-select>
      </a-form-item>
      <a-form-item v-if="space" label="空间大小" name="maxSize">
        <a-input-number
          v-model:value="space.maxSize"
          :formatter="(value: number) => formatSize(value)"
          :parser="
            (value: string) => {
              const num = parseFloat(value.replace(/[^0-9.]/g, ''))
              if (isNaN(num)) return 0
              if (value.includes('GB')) return Math.round(num * 1024 * 1024 * 1024)
              if (value.includes('MB')) return Math.round(num * 1024 * 1024)
              if (value.includes('KB')) return Math.round(num * 1024)
              return Math.round(num)
            }
          "
          placeholder="请输入空间大小，单位：MB"
          style="width: 240px"
          allow-clear
        />
      </a-form-item>
      <a-form-item v-if="space" label="空间数量" name="maxCount">
        <a-input-number
          v-model:value="space.maxCount"
          placeholder="请输入空间数量"
          style="width: 240px"
          :auto-size="{ minRows: 1 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
      </a-form-item>
    </a-form>
    <!-- 空间级别介绍 -->
    <a-card title="空间级别介绍" style="width: 100%">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://github.com/HLLLG" target="_blank">程序员HL</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}: 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceLevelsUsingGet,
  getSpaceVoByIdUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/Space.ts'
import { formatSize } from '@/utils'

const router = useRouter()
const space = ref<API.SpaceVO>()
const loading = ref<boolean>(false)

const route = useRoute()
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query?.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})

const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const spaceId = space.value?.id
  let res
  if (spaceId) {
    // 编辑空间
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
      maxSize: space.value?.maxSize, // 使用当前值，防止被覆盖
      maxCount: space.value?.maxCount,
    })
  } else {
    // 新建空间
    res = await addSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value,
    })
  }
  // 操作成功
  if (res.data.code === 0 || res.data.data) {
    message.success('操作成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${spaceId ?? res.data.data}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

const doSelect = (value: number) => {
  // 根据选择的空间级别，自动填充空间大小和数量
  const level = spaceLevelList.value.find((level) => level.value === value)
  if (level && space.value) {
    space.value.maxSize = level.maxSize
    space.value.maxCount = level.maxCount
  }
}

const getOldSpace = async () => {
  const spaceId = route.query?.id
  const res = await getSpaceVoByIdUsingGet({
    id: spaceId,
  })
  if (res.data.code === 0 || res.data.data) {
    const data = res.data.data
    space.value = data
    // 填充表单
    spaceForm.spaceName = data.spaceName
    spaceForm.spaceLevel = data.spaceLevel
  }
}

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await getSpaceLevelsUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  getOldSpace()
  fetchSpaceLevelList()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
