<template>
  <div class="space-category-analyze">
    <a-card title="图库分类占用">
      <v-chart :option="option" style="height: 320px; max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController.ts'
import VChart from 'vue-echarts'

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
const dataList = ref<API.SpaceCategoryAnalyzeResponse[]>([])

// 获取数据
const fetchData = async () => {
  console.log(props.spaceId)
  loading.value = true
  try {
    const res = await getSpaceCategoryAnalyzeUsingPost({
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
  const categories = dataList.value.map((item) => item.category)
  const countData = dataList.value.map((item) => item.count)
  const sizeData = dataList.value.map((item) => (item.totalSize / (1024 * 1024)).toFixed(2)) // 转为 MB

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['图片数量', '图片总大小'], top: 'bottom' },
    xAxis: { type: 'category', data: categories },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        axisLine: { show: true, lineStyle: { color: '#5470C6' } }, // 左轴颜色
      },
      {
        type: 'value',
        name: '图片总大小 (MB)',
        position: 'right',
        axisLine: { show: true, lineStyle: { color: '#91CC75' } }, // 右轴颜色
        splitLine: {
          lineStyle: {
            color: '#91CC75', // 调整网格线颜色
            type: 'dashed', // 线条样式：可选 'solid', 'dashed', 'dotted'
          },
        },
      },
    ],
    series: [
      { name: '图片数量', type: 'bar', data: countData, yAxisIndex: 0 },
      { name: '图片总大小', type: 'bar', data: sizeData, yAxisIndex: 1 },
    ],
  }
})
</script>

<style scoped></style>
