<template>
  <div class="space-rank-analyze">
    <a-card title="空间使用排行分析">
      <v-chart :option="option" style="height: 320px; max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceRankAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
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

// 加载状态
const loading = ref<boolean>(false)
const dataList = ref<API.Space[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceRankAnalyzeUsingPost({
      spaceId: props.spaceId,
      queryPublic: props.queryPublic,
      queryAll: props.queryAll,
      topN: 10, // 获取前10名
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

// 监听变量，改变时重新获取数据
watchEffect(() => {
  fetchData()
})

const option = computed(() => {
  const spaceNames = dataList.value.map((item) => item.spaceName)
  const usageData = dataList.value.map((item) => (item.totalSize / (1024 * 1024)).toFixed(2)) // 转为 MB

  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: spaceNames,
    },
    yAxis: {
      type: 'value',
      name: '空间使用量 (MB)',
    },
    series: [
      {
        name: '空间使用量 (MB)',
        type: 'bar',
        data: usageData,
        itemStyle: {
          color: '#5470C6', // 自定义柱状图颜色
        },
      },
    ],
  }
})
</script>

<style scoped></style>
