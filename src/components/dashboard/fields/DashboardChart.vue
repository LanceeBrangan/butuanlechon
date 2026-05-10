<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  todayReport: { type: Object, default: () => ({ sales: 0, expenses: 0 }) },
  profitToday: { type: Number, default: 0 },
})

const chartRef = ref(null)
let chartInstance = null

const buildChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: ['Sales', 'Expenses', 'Profit'],
      datasets: [{
        label: 'Amount (₱)',
        data: [props.todayReport.sales, props.todayReport.expenses, props.profitToday],
        backgroundColor: [
          'rgba(46, 125, 50, 0.7)',
          'rgba(198, 40, 40, 0.7)',
          props.profitToday >= 0 ? 'rgba(0, 137, 123, 0.7)' : 'rgba(230, 81, 0, 0.7)',
        ],
        borderColor: [
          'rgba(46, 125, 50, 1)',
          'rgba(198, 40, 40, 1)',
          props.profitToday >= 0 ? 'rgba(0, 137, 123, 1)' : 'rgba(230, 81, 0, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: (v) => '₱' + v.toLocaleString(), font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' } },
        },
      },
    },
  })
}

watch(() => [props.todayReport, props.profitToday], () => {
  if (!chartInstance) return
  chartInstance.data.datasets[0].data = [props.todayReport.sales, props.todayReport.expenses, props.profitToday]
  chartInstance.data.datasets[0].backgroundColor[2] = props.profitToday >= 0 ? 'rgba(0, 137, 123, 0.7)' : 'rgba(230, 81, 0, 0.7)'
  chartInstance.data.datasets[0].borderColor[2]     = props.profitToday >= 0 ? 'rgba(0, 137, 123, 1)'   : 'rgba(230, 81, 0, 1)'
  chartInstance.update()
}, { deep: true })

onMounted(() => setTimeout(buildChart, 100))
onBeforeUnmount(() => chartInstance?.destroy())
</script>

<template>
  <div class="section-card mb-5">
    <div class="section-card-header">
      <div class="d-flex align-center ga-2">
        <v-icon size="18" color="#8b0000">mdi-chart-areaspline</v-icon>
        <span class="section-card-title">Financial Overview — Today</span>
      </div>
    </div>
    <div class="section-card-body">
      <canvas ref="chartRef" height="110"></canvas>
    </div>
  </div>
</template>

<style scoped>
.section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.section-card-title { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
.section-card-body { padding: 20px; }
</style>
