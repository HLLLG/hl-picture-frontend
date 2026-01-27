<template>
  <div class="space-level-analyze">
    <a-card title="空间等级分析">
      <v-chart :option="option" style="height: 320px; max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import {
  getSpaceLevelAnalyzeUsingPost,
  getSpaceRankAnalyzeUsingPost,
} from '@/api/spaceAnalyzeController.ts'
import VChart from 'vue-echarts'
import 'echarts-wordcloud'
import { SPACE_LEVEL_MAP } from '@/constants/Space.ts'

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
const dataList = ref<API.SpaceLevelAnalyzeResponse[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceLevelAnalyzeUsingPost({
      spaceId: props.spaceId,
      queryPublic: props.queryPublic,
      queryAll: props.queryAll,
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
  const spaceLevel = dataList.value.map((item) => SPACE_LEVEL_MAP[item.spaceLevel])
  const usageData = dataList.value.map((item) => item.count)

  return {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: spaceLevel,
    },
    yAxis: {
      type: 'value',
      name: '空间数量',
    },
    series: [
      {
        name: '空间数量 ',
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
