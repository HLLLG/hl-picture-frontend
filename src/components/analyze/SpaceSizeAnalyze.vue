<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析">
      <v-chart :option="option" style="height: 320px; max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
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
const dataList = ref<API.SpaceSizeAnalyzeResponse[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceSizeAnalyzeUsingPost({
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
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
      },
    ],
  }
})
</script>

<style scoped></style>
