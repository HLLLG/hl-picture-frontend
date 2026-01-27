<template>
  <div class="space-user-analyze">
    <a-card title="空间图片用户分析">
      <v-chart :option="option" style="height: 320px; max-width: 100%" :loading="loading"></v-chart>
      <template #extra>
        <a-space>
          <a-segmented v-model:value="timeDimension" :options="timeDimensionOptions" />
          <a-input-search
            placeholder="请输入用户 id "
            enter-button="搜索用户"
            @search="doSearch"
          ></a-input-search>
        </a-space>
      </template>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceUserAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import VChart from 'vue-echarts'
import 'echarts-wordcloud'

interface Props {
  spaceId?: number
  queryPublic?: boolean
  queryAll?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  queryPublic: false,
  queryAll: false,
})

const userId = ref<string>()
const timeDimensionOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]
const timeDimension = ref<string>('day')

// 加载状态
const loading = ref<boolean>(false)
const dataList = ref<API.SpaceUserAnalyzeResponse[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceUserAnalyzeUsingPost({
      spaceId: props.spaceId,
      queryPublic: props.queryPublic,
      queryAll: props.queryAll,
      timeDimension: timeDimension.value,
      userId: userId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败，' + error)
  }
  loading.value = false
}

// 搜索用户
const doSearch = (value: string) => {
  userId.value = value || undefined
}

// 监听变量，改变时重新获取数据
watchEffect(() => {
  fetchData()
})

const option = computed(() => {
  const periods = dataList.value.map((item) => item.period) // 时间区间
  const counts = dataList.value.map((item) => item.count) // 上传数量

  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: periods, name: '时间区间' },
    yAxis: { type: 'value', name: '上传数量' },
    series: [
      {
        name: '上传数量',
        type: 'line',
        data: counts,
        smooth: true, // 平滑折线
        emphasis: {
          focus: 'series',
        },
      },
    ],
  }
})
</script>

<style scoped></style>
