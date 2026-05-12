<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/products/index.js'
import Chart from 'chart.js/auto'
import {
  exportDailyExcel,
  exportMonthlyExcel,
  exportMonthlyDetailExcel,
  exportFullReportExcel,
} from './useExcelExport.js'

import { useAuthUserStore } from '@/stores/authUser'

const authStore = useAuthUserStore()
const { products, allReports, lowStockProducts, fetchProducts } = useProducts() // ← FIRST



onMounted(async () => {
  await fetchProducts()
})


const router = useRouter()




// ── Computed summaries ──
const totalSales = computed(() => allReports.value.reduce((s, r) => s + r.sales, 0))
const totalExpenses = computed(() => allReports.value.reduce((s, r) => s + r.expenses, 0))
const totalProfit = computed(() => allReports.value.reduce((s, r) => s + r.profit, 0))
const bestDay = computed(() => {
  if (!allReports.value.length) return null
  return allReports.value.reduce((a, b) => (a.profit > b.profit ? a : b))
})

const recentReports = computed(() => [...allReports.value].slice(0, 7).reverse())

const topProducts = computed(() =>
  [...products.value].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, 6),
)

// ── Monthly Reports ──
const selectedMonth = ref(new Date().toISOString().slice(0, 7))

const monthlyReports = computed(() => {
  const grouped = {}
  allReports.value.forEach((r) => {
    const month = r.date.slice(0, 7)
    if (!grouped[month]) grouped[month] = { sales: 0, expenses: 0, profit: 0, days: 0 }
    grouped[month].sales += r.sales
    grouped[month].expenses += r.expenses
    grouped[month].profit += r.profit
    grouped[month].days += 1
  })
  return Object.entries(grouped)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, data]) => ({ month, ...data }))
})

const availableMonths = computed(() =>
  monthlyReports.value.map((m) => ({
    title: formatMonth(m.month),
    value: m.month,
  })),
)

const filteredDailyReports = computed(() =>
  allReports.value.filter((r) => r.date.startsWith(selectedMonth.value)),
)

const selectedMonthSummary = computed(() => {
  const found = monthlyReports.value.find((m) => m.month === selectedMonth.value)
  return found || { sales: 0, expenses: 0, profit: 0, days: 0 }
})

// ── Charts ──
let barChart = null
let donutChart = null
let monthlyChart = null

const buildBarChart = () => {
  const ctx = document.getElementById('salesBarChart')
  if (!ctx) return
  if (barChart) barChart.destroy()
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: recentReports.value.map((r) => {
        const d = new Date(r.date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: 'Sales',
          data: recentReports.value.map((r) => r.sales),
          backgroundColor: 'rgba(46,125,50,0.75)',
          borderColor: 'rgba(46,125,50,1)',
          borderWidth: 2,
          borderRadius: 7,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: recentReports.value.map((r) => r.expenses),
          backgroundColor: 'rgba(198,40,40,0.75)',
          borderColor: 'rgba(198,40,40,1)',
          borderWidth: 2,
          borderRadius: 7,
          borderSkipped: false,
        },
        {
          label: 'Profit',
          data: recentReports.value.map((r) => r.profit),
          backgroundColor: 'rgba(21,101,192,0.75)',
          borderColor: 'rgba(21,101,192,1)',
          borderWidth: 2,
          borderRadius: 7,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 12, weight: '600' },
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 20,
          },
        },
        tooltip: { callbacks: { label: (ctx) => ` ₱${ctx.parsed.y.toLocaleString()}` } },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: (v) => '₱' + v.toLocaleString(), font: { size: 11 } },
        },
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' } } },
      },
    },
  })
}

const buildDonutChart = () => {
  const ctx = document.getElementById('profitDonut')
  if (!ctx) return
  if (donutChart) donutChart.destroy()
  const profitable = allReports.value.filter((r) => r.profit > 0).length
  const losing = allReports.value.filter((r) => r.profit <= 0).length
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Profitable Days', 'Loss Days'],
      datasets: [
        {
          data: [profitable || 0, losing || 0],
          backgroundColor: ['rgba(46,125,50,0.85)', 'rgba(198,40,40,0.85)'],
          borderColor: ['#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12, weight: '600' }, usePointStyle: true, padding: 16 },
        },
      },
    },
  })
}

const buildMonthlyChart = () => {
  const ctx = document.getElementById('monthlyBarChart')
  if (!ctx) return
  if (monthlyChart) monthlyChart.destroy()
  const data = [...monthlyReports.value].reverse()
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((m) => formatMonth(m.month)),
      datasets: [
        {
          label: 'Sales',
          data: data.map((m) => m.sales),
          backgroundColor: 'rgba(46,125,50,0.75)',
          borderColor: 'rgba(46,125,50,1)',
          borderWidth: 2,
          borderRadius: 7,
        },
        {
          label: 'Expenses',
          data: data.map((m) => m.expenses),
          backgroundColor: 'rgba(198,40,40,0.75)',
          borderColor: 'rgba(198,40,40,1)',
          borderWidth: 2,
          borderRadius: 7,
        },
        {
          label: 'Profit',
          data: data.map((m) => m.profit),
          backgroundColor: 'rgba(21,101,192,0.75)',
          borderColor: 'rgba(21,101,192,1)',
          borderWidth: 2,
          borderRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 12, weight: '600' },
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 20,
          },
        },
        tooltip: { callbacks: { label: (ctx) => ` ₱${ctx.parsed.y.toLocaleString()}` } },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: (v) => '₱' + v.toLocaleString(), font: { size: 11 } },
        },
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '600' } } },
      },
    },
  })
}

// ── Helpers ──
const profitColor = (val) => (val >= 0 ? '#2e7d32' : '#c62828')
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatMonth = (m) => {
  const [year, month] = m.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// ── Export ──
const exportDailyCSV = () => exportDailyExcel(allReports.value)
const exportMonthlyCSV = () => exportMonthlyExcel(allReports.value)
const exportMonthlyDetailCSV = () => exportMonthlyDetailExcel(allReports.value, selectedMonth.value)
const exportFullReport = () => exportFullReportExcel(allReports.value, products.value)

// ── Active tab ── (IMPORTANTE: naa ni sa ubos sa mga functions)
const activeTab = ref('daily')

// ── Watchers ──
watch(
  allReports,
  async () => {
    await nextTick()
    buildBarChart()
    buildDonutChart()
  },
  { deep: true },
)

watch(activeTab, async (newTab) => {
  if (newTab === 'monthly') {
    await nextTick()
    buildMonthlyChart()
  }
})

watch(selectedMonth, async () => {
  await nextTick()
})
</script>

<template>
  <div class="ss-bg">
    <v-container fluid class="pa-6 pa-md-8">
      <!-- ── Top Bar ── -->
      <div class="top-bar mb-8">
        <div class="top-bar-left">
          <v-btn icon variant="text" class="back-btn mr-2" @click="router.back()">
            <v-icon color="white" size="20">mdi-arrow-left</v-icon>
          </v-btn>
          <div class="top-bar-icon">
            <v-icon size="26" color="white">mdi-chart-areaspline</v-icon>
          </div>
          <div>
            <p class="top-eyebrow">Inventory System</p>
            <h1 class="top-title">Sales Summary</h1>
          </div>
        </div>
        <div class="d-flex align-center ga-3 flex-wrap">
          <!-- Export Buttons -->
          <v-btn
            variant="flat"
            size="small"
            rounded="lg"
            class="export-btn-daily"
            @click="exportDailyCSV"
          >
            <v-icon start size="16">mdi-download</v-icon>
            Export Daily
          </v-btn>
          <v-btn
            variant="flat"
            size="small"
            rounded="lg"
            class="export-btn-monthly"
            @click="exportMonthlyCSV"
          >
            <v-icon start size="16">mdi-download</v-icon>
            Export Monthly
          </v-btn>
          <div class="date-badge">
            <v-icon size="14" class="mr-1" style="color: #8b0000">mdi-calendar-month</v-icon>
            <span class="date-badge-text"
              >{{ allReports.length }} day{{ allReports.length !== 1 ? 's' : '' }} recorded</span
            >
          </div>
        </div>
      </div>

      <!-- ── KPI Row ── -->
      <v-row dense class="mb-6">
        <v-col cols="12" sm="6" lg="3">
          <div class="kpi-card kpi-green">
            <div class="kpi-icon-wrap">
              <v-icon size="22" color="white">mdi-cash-multiple</v-icon>
            </div>
            <p class="kpi-label">Total Sales</p>
            <p class="kpi-value">₱{{ totalSales.toLocaleString() }}</p>
            <p class="kpi-sub">all-time revenue</p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="kpi-card kpi-red">
            <div class="kpi-icon-wrap">
              <v-icon size="22" color="white">mdi-cart-outline</v-icon>
            </div>
            <p class="kpi-label">Total Expenses</p>
            <p class="kpi-value">₱{{ totalExpenses.toLocaleString() }}</p>
            <p class="kpi-sub">all-time spending</p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="kpi-card" :class="totalProfit >= 0 ? 'kpi-teal' : 'kpi-orange'">
            <div class="kpi-icon-wrap">
              <v-icon size="22" color="white">{{
                totalProfit >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
              }}</v-icon>
            </div>
            <p class="kpi-label">Net Profit</p>
            <p class="kpi-value">₱{{ totalProfit.toLocaleString() }}</p>
            <p class="kpi-sub">{{ totalProfit >= 0 ? 'overall gain' : 'overall loss' }}</p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="kpi-card kpi-blue">
            <div class="kpi-icon-wrap">
              <v-icon size="22" color="white">mdi-trophy-outline</v-icon>
            </div>
            <p class="kpi-label">Best Day Profit</p>
            <p class="kpi-value">{{ bestDay ? '₱' + bestDay.profit.toLocaleString() : '—' }}</p>
            <p class="kpi-sub">{{ bestDay ? formatDate(bestDay.date) : 'no data yet' }}</p>
          </div>
        </v-col>
      </v-row>

      <!-- ── Tabs ── -->
      <div class="tab-bar mb-5">
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'daily' }"
          @click="activeTab = 'daily'"
        >
          <v-icon size="16" class="mr-1">mdi-calendar-today</v-icon> Daily Reports
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === 'monthly' }"
          @click="activeTab = 'monthly'"
        >
          <v-icon size="16" class="mr-1">mdi-calendar-month</v-icon> Monthly Reports
        </button>
      </div>

      <!-- ══════════ DAILY TAB ══════════ -->
      <div v-if="activeTab === 'daily'">
        <v-row dense>
          <v-col cols="12" lg="8">
            <!-- Bar Chart -->
            <div class="section-card mb-5">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-chart-bar</v-icon>
                  <span class="section-card-title">Daily Sales vs Expenses vs Profit</span>
                </div>
                <span class="section-card-sub">Last {{ recentReports.length }} days</span>
              </div>
              <div class="section-card-body">
                <div v-if="recentReports.length === 0" class="empty-chart">
                  <v-icon size="42" color="grey-lighten-2" class="mb-2"
                    >mdi-chart-bar-stacked</v-icon
                  >
                  <p class="empty-chart-text">
                    No daily reports yet. End a day from the Dashboard to generate data.
                  </p>
                </div>
                <canvas v-else id="salesBarChart" height="120"></canvas>
              </div>
            </div>

            <!-- Daily Reports Table -->
            <div class="section-card">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-table-large</v-icon>
                  <span class="section-card-title">Daily Report History</span>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-chip size="small" color="error" variant="tonal"
                    >{{ allReports.length }} entries</v-chip
                  >
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="success"
                    rounded="lg"
                    @click="exportDailyCSV"
                  >
                    <v-icon size="13" start>mdi-microsoft-excel</v-icon>CSV
                  </v-btn>
                </div>
              </div>
              <div v-if="allReports.length === 0" class="empty-chart pa-10 text-center">
                <v-icon size="38" color="grey-lighten-2" class="mb-2"
                  >mdi-calendar-blank-outline</v-icon
                >
                <p class="empty-chart-text">No reports found.</p>
              </div>
              <div v-else class="table-wrap">
                <v-table class="report-table" hover>
                  <thead>
                    <tr>
                      <th class="th-cell">Date</th>
                      <th class="th-cell">Sales</th>
                      <th class="th-cell">Expenses</th>
                      <th class="th-cell">Net Profit</th>
                      <th class="th-cell">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in allReports" :key="r.date" class="td-row">
                      <td class="td-cell">
                        <v-chip size="small" color="blue-grey" variant="tonal" class="date-chip">
                          <v-icon start size="11">mdi-calendar</v-icon>{{ formatDate(r.date) }}
                        </v-chip>
                      </td>
                      <td class="td-cell">
                        <span class="val-green">₱{{ r.sales.toLocaleString() }}</span>
                      </td>
                      <td class="td-cell">
                        <span class="val-red">₱{{ r.expenses.toLocaleString() }}</span>
                      </td>
                      <td class="td-cell">
                        <span
                          class="profit-badge"
                          :style="{
                            color: profitColor(r.profit),
                            background: r.profit >= 0 ? '#e8f5e9' : '#fff5f5',
                            border: `1px solid ${r.profit >= 0 ? '#a5d6a7' : '#ffcdd2'}`,
                          }"
                        >
                          {{ r.profit >= 0 ? '+' : '' }}₱{{ r.profit.toLocaleString() }}
                        </span>
                      </td>
                      <td class="td-cell">
                        <div class="margin-wrap">
                          <div class="margin-bar-track">
                            <div
                              class="margin-bar-fill"
                              :style="{
                                width:
                                  r.sales > 0
                                    ? Math.min(Math.abs(r.profit / r.sales) * 100, 100) + '%'
                                    : '0%',
                                background:
                                  r.profit >= 0
                                    ? 'linear-gradient(90deg,#2e7d32,#66bb6a)'
                                    : 'linear-gradient(90deg,#8b0000,#ef5350)',
                              }"
                            ></div>
                          </div>
                          <span class="margin-pct" :style="{ color: profitColor(r.profit) }"
                            >{{ r.sales > 0 ? ((r.profit / r.sales) * 100).toFixed(1) : 0 }}%</span
                          >
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </div>
          </v-col>

          <!-- Right Sidebar -->
          <v-col cols="12" lg="4">
            <div class="section-card mb-5">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-chart-donut</v-icon>
                  <span class="section-card-title">Profitable vs Loss Days</span>
                </div>
              </div>
              <div class="section-card-body">
                <div v-if="allReports.length === 0" class="empty-chart text-center py-6">
                  <v-icon size="38" color="grey-lighten-2" class="mb-2">mdi-chart-donut</v-icon>
                  <p class="empty-chart-text">No data yet.</p>
                </div>
                <canvas v-else id="profitDonut" height="200"></canvas>
              </div>
            </div>

            <div class="section-card mb-5">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-star-outline</v-icon>
                  <span class="section-card-title">Top Products by Value</span>
                </div>
                <v-chip size="small" color="error" variant="tonal">{{ topProducts.length }}</v-chip>
              </div>
              <div class="section-card-body pa-0">
                <div v-if="topProducts.length === 0" class="pa-8 text-center">
                  <v-icon size="36" color="grey-lighten-2" class="mb-2"
                    >mdi-package-variant-closed</v-icon
                  >
                  <p class="empty-chart-text">No products yet.</p>
                </div>
                <div
                  v-for="(p, i) in topProducts"
                  :key="p.id"
                  class="top-product-row"
                  :class="{ 'top-product-row--last': i === topProducts.length - 1 }"
                >
                  <div class="rank-badge">{{ i + 1 }}</div>
                  <div class="top-product-avatar">{{ p.name.charAt(0).toUpperCase() }}</div>
                  <div class="flex-grow-1">
                    <p class="top-product-name">{{ p.name }}</p>
                    <p class="top-product-meta">{{ p.quantity }} {{ p.unit }}</p>
                  </div>
                  <span class="top-product-val">₱{{ p.totalPrice.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-lightning-bolt-outline</v-icon>
                  <span class="section-card-title">Quick Stats</span>
                </div>
              </div>
              <div class="section-card-body">
                <div class="qs-row">
                  <span class="qs-label">Avg Daily Sales</span
                  ><span class="qs-val"
                    >₱{{
                      allReports.length
                        ? Math.round(totalSales / allReports.length).toLocaleString()
                        : 0
                    }}</span
                  >
                </div>
                <div class="qs-row">
                  <span class="qs-label">Avg Daily Profit</span
                  ><span class="qs-val" :style="{ color: profitColor(totalProfit) }"
                    >₱{{
                      allReports.length
                        ? Math.round(totalProfit / allReports.length).toLocaleString()
                        : 0
                    }}</span
                  >
                </div>
                <div class="qs-row">
                  <span class="qs-label">Total Products</span
                  ><span class="qs-val">{{ products.length }}</span>
                </div>
                <div class="qs-row">
                  <span class="qs-label">Low Stock Items</span
                  ><span class="qs-val" style="color: #c62828">{{ lowStockProducts.length }}</span>
                </div>
                <div class="qs-row">
                  <span class="qs-label">Overall Margin</span
                  ><span class="qs-val" :style="{ color: profitColor(totalProfit) }"
                    >{{ totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0 }}%</span
                  >
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- ══════════ MONTHLY TAB ══════════ -->
      <div v-if="activeTab === 'monthly'">
        <v-row dense>
          <v-col cols="12" lg="8">
            <!-- Monthly Bar Chart -->
            <div class="section-card mb-5">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-chart-bar</v-icon>
                  <span class="section-card-title">Monthly Sales vs Expenses vs Profit</span>
                </div>
                <span class="section-card-sub">{{ monthlyReports.length }} months</span>
              </div>
              <div class="section-card-body">
                <div v-if="monthlyReports.length === 0" class="empty-chart">
                  <v-icon size="42" color="grey-lighten-2" class="mb-2"
                    >mdi-chart-bar-stacked</v-icon
                  >
                  <p class="empty-chart-text">No monthly data yet.</p>
                </div>
                <canvas v-else id="monthlyBarChart" height="120"></canvas>
              </div>
            </div>

            <!-- Monthly Detail Table -->
            <div class="section-card">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-table-large</v-icon>
                  <span class="section-card-title">Monthly Breakdown</span>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-select
                    v-model="selectedMonth"
                    :items="availableMonths"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="min-width: 180px; max-width: 200px"
                    class="month-select"
                  />
                  <v-btn
                    size="x-small"
                    variant="tonal"
                    color="success"
                    rounded="lg"
                    @click="exportMonthlyDetailCSV"
                  >
                    <v-icon size="13" start>mdi-microsoft-excel</v-icon>CSV
                  </v-btn>
                </div>
              </div>

              <!-- Selected month summary -->
              <div class="month-summary-row px-5 py-4">
                <div class="month-sum-item">
                  <p class="month-sum-label">Sales</p>
                  <p class="month-sum-val month-sum-val--green">
                    ₱{{ selectedMonthSummary.sales.toLocaleString() }}
                  </p>
                </div>
                <div class="month-sum-divider"></div>
                <div class="month-sum-item">
                  <p class="month-sum-label">Expenses</p>
                  <p class="month-sum-val month-sum-val--red">
                    ₱{{ selectedMonthSummary.expenses.toLocaleString() }}
                  </p>
                </div>
                <div class="month-sum-divider"></div>
                <div class="month-sum-item">
                  <p class="month-sum-label">Net Profit</p>
                  <p
                    class="month-sum-val"
                    :style="{ color: profitColor(selectedMonthSummary.profit) }"
                  >
                    ₱{{ selectedMonthSummary.profit.toLocaleString() }}
                  </p>
                </div>
                <div class="month-sum-divider"></div>
                <div class="month-sum-item">
                  <p class="month-sum-label">Days</p>
                  <p class="month-sum-val">{{ selectedMonthSummary.days }}</p>
                </div>
              </div>

              <v-divider></v-divider>

              <div v-if="filteredDailyReports.length === 0" class="empty-chart pa-10 text-center">
                <v-icon size="38" color="grey-lighten-2" class="mb-2"
                  >mdi-calendar-blank-outline</v-icon
                >
                <p class="empty-chart-text">No reports for this month.</p>
              </div>
              <div v-else class="table-wrap">
                <v-table class="report-table" hover>
                  <thead>
                    <tr>
                      <th class="th-cell">Date</th>
                      <th class="th-cell">Sales</th>
                      <th class="th-cell">Expenses</th>
                      <th class="th-cell">Net Profit</th>
                      <th class="th-cell">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in filteredDailyReports" :key="r.date" class="td-row">
                      <td class="td-cell">
                        <v-chip size="small" color="blue-grey" variant="tonal" class="date-chip">
                          <v-icon start size="11">mdi-calendar</v-icon>{{ formatDate(r.date) }}
                        </v-chip>
                      </td>
                      <td class="td-cell">
                        <span class="val-green">₱{{ r.sales.toLocaleString() }}</span>
                      </td>
                      <td class="td-cell">
                        <span class="val-red">₱{{ r.expenses.toLocaleString() }}</span>
                      </td>
                      <td class="td-cell">
                        <span
                          class="profit-badge"
                          :style="{
                            color: profitColor(r.profit),
                            background: r.profit >= 0 ? '#e8f5e9' : '#fff5f5',
                            border: `1px solid ${r.profit >= 0 ? '#a5d6a7' : '#ffcdd2'}`,
                          }"
                        >
                          {{ r.profit >= 0 ? '+' : '' }}₱{{ r.profit.toLocaleString() }}
                        </span>
                      </td>
                      <td class="td-cell">
                        <div class="margin-wrap">
                          <div class="margin-bar-track">
                            <div
                              class="margin-bar-fill"
                              :style="{
                                width:
                                  r.sales > 0
                                    ? Math.min(Math.abs(r.profit / r.sales) * 100, 100) + '%'
                                    : '0%',
                                background:
                                  r.profit >= 0
                                    ? 'linear-gradient(90deg,#2e7d32,#66bb6a)'
                                    : 'linear-gradient(90deg,#8b0000,#ef5350)',
                              }"
                            ></div>
                          </div>
                          <span class="margin-pct" :style="{ color: profitColor(r.profit) }"
                            >{{ r.sales > 0 ? ((r.profit / r.sales) * 100).toFixed(1) : 0 }}%</span
                          >
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </div>
          </v-col>

          <!-- Right: Monthly Summary Cards -->
          <v-col cols="12" lg="4">
            <div class="section-card">
              <div class="section-card-header">
                <div class="d-flex align-center ga-2">
                  <v-icon size="18" color="#8b0000">mdi-calendar-month</v-icon>
                  <span class="section-card-title">All Months Summary</span>
                </div>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="success"
                  rounded="lg"
                  @click="exportMonthlyCSV"
                >
                  <v-icon size="13" start>mdi-microsoft-excel</v-icon>CSV
                </v-btn>
              </div>
              <div class="section-card-body pa-0">
                <div v-if="monthlyReports.length === 0" class="pa-8 text-center">
                  <v-icon size="36" color="grey-lighten-2" class="mb-2"
                    >mdi-calendar-blank-outline</v-icon
                  >
                  <p class="empty-chart-text">No monthly data yet.</p>
                </div>
                <div
                  v-for="(m, i) in monthlyReports"
                  :key="m.month"
                  class="monthly-row"
                  :class="{
                    'monthly-row--active': selectedMonth === m.month,
                    'monthly-row--last': i === monthlyReports.length - 1,
                  }"
                  @click="selectedMonth = m.month"
                >
                  <div class="monthly-row-top">
                    <span class="monthly-name">{{ formatMonth(m.month) }}</span>
                    <span class="monthly-days">{{ m.days }} days</span>
                  </div>
                  <div class="monthly-row-stats">
                    <span class="val-green text-caption font-weight-bold"
                      >₱{{ m.sales.toLocaleString() }}</span
                    >
                    <span class="text-caption text-grey mx-1">|</span>
                    <span class="val-red text-caption font-weight-bold"
                      >₱{{ m.expenses.toLocaleString() }}</span
                    >
                    <span class="text-caption text-grey mx-1">|</span>
                    <span
                      class="text-caption font-weight-bold"
                      :style="{ color: profitColor(m.profit) }"
                      >₱{{ m.profit.toLocaleString() }}</span
                    >
                  </div>
                  <div class="monthly-profit-bar-track mt-1">
                    <div
                      class="monthly-profit-bar-fill"
                      :style="{
                        width: m.sales > 0 ? Math.min((m.profit / m.sales) * 100, 100) + '%' : '0%',
                        background:
                          m.profit >= 0
                            ? 'linear-gradient(90deg,#2e7d32,#66bb6a)'
                            : 'linear-gradient(90deg,#8b0000,#ef5350)',
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.ss-bg {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Top Bar ── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  background: linear-gradient(120deg, #7b0000 0%, #b71c1c 60%, #c62828 100%);
  border-radius: 16px;
  padding: 20px 28px;
  box-shadow: 0 4px 24px rgba(139, 0, 0, 0.2);
}
.top-bar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.back-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 10px !important;
  width: 36px !important;
  height: 36px !important;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
}
.top-bar-icon {
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.top-eyebrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0;
}
.top-title {
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
}
.date-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 10px;
  padding: 8px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.date-badge-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
}

.export-btn-daily {
  background: rgba(255, 255, 255, 0.92) !important;
  color: #2e7d32 !important;
  font-weight: 700 !important;
  font-size: 0.78rem !important;
  text-transform: none !important;
}
.export-btn-monthly {
  background: rgba(255, 255, 255, 0.92) !important;
  color: #1565c0 !important;
  font-weight: 700 !important;
  font-size: 0.78rem !important;
  text-transform: none !important;
}

/* ── Tabs ── */
.tab-bar {
  display: flex;
  gap: 4px;
  background: #fff;
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: fit-content;
}
.tab-btn {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 9px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: #666;
  background: transparent;
  transition: all 0.2s ease;
}
.tab-btn:hover {
  background: #f5f5f5;
  color: #333;
}
.tab-btn--active {
  background: linear-gradient(135deg, #7b0000, #c62828);
  color: #fff;
}

/* ── KPI Cards ── */
.kpi-card {
  border-radius: 14px;
  padding: 20px 22px;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
}
.kpi-card::after {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.kpi-green {
  background: linear-gradient(135deg, #1b5e20, #388e3c);
}
.kpi-red {
  background: linear-gradient(135deg, #7b0000, #c62828);
}
.kpi-teal {
  background: linear-gradient(135deg, #00695c, #00897b);
}
.kpi-orange {
  background: linear-gradient(135deg, #e65100, #f57c00);
}
.kpi-blue {
  background: linear-gradient(135deg, #1565c0, #1976d2);
}
.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.kpi-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  opacity: 0.8;
  margin: 0 0 4px;
}
.kpi-value {
  font-size: 1.55rem;
  font-weight: 800;
  margin: 0 0 2px;
  line-height: 1;
}
.kpi-sub {
  font-size: 0.72rem;
  opacity: 0.7;
  margin: 0;
}

/* ── Section Cards ── */
.section-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 20px;
}
.section-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.section-card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
}
.section-card-sub {
  font-size: 0.75rem;
  color: #888;
}
.section-card-body {
  padding: 20px;
}

/* ── Month Select ── */
.month-select :deep(.v-field) {
  border-radius: 9px;
  font-size: 0.82rem;
}

/* ── Month Summary Row ── */
.month-summary-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}
.month-sum-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
}
.month-sum-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 2px;
}
.month-sum-val {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
  color: #1a1a1a;
}
.month-sum-val--green {
  color: #2e7d32;
}
.month-sum-val--red {
  color: #c62828;
}
.month-sum-divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
}

/* ── Monthly rows in sidebar ── */
.monthly-row {
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
}
.monthly-row:hover {
  background: #fdf5f5;
}
.monthly-row--active {
  background: #fff5f5;
  border-left: 3px solid #c62828;
}
.monthly-row--last {
  border-bottom: none;
}
.monthly-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}
.monthly-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a1a1a;
}
.monthly-days {
  font-size: 0.72rem;
  color: #888;
}
.monthly-row-stats {
  display: flex;
  align-items: center;
}
.monthly-profit-bar-track {
  height: 4px;
  background: #f0f0f0;
  border-radius: 99px;
  overflow: hidden;
}
.monthly-profit-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

/* ── Empty ── */
.empty-chart {
  text-align: center;
  padding: 32px 16px;
}
.empty-chart-text {
  font-size: 0.82rem;
  color: #aaa;
  margin: 0;
}

/* ── Table ── */
.table-wrap {
  overflow-x: auto;
}
.report-table {
  width: 100%;
}
.th-cell {
  background: #fafafa !important;
  color: #555 !important;
  font-size: 0.71rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  padding: 13px 18px !important;
  border-bottom: 2px solid #f0f0f0 !important;
  white-space: nowrap;
}
.td-row {
  transition: background 0.15s;
}
.td-row:hover {
  background: #fdf5f5 !important;
}
.td-row:not(:last-child) td {
  border-bottom: 1px solid #f8f8f8;
}
.td-cell {
  padding: 12px 18px !important;
  vertical-align: middle;
}
.date-chip {
  font-size: 0.71rem !important;
}
.val-green {
  font-weight: 700;
  color: #2e7d32;
  font-size: 0.88rem;
}
.val-red {
  font-weight: 700;
  color: #c62828;
  font-size: 0.88rem;
}
.profit-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 800;
}
.margin-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 110px;
}
.margin-bar-track {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 99px;
  overflow: hidden;
}
.margin-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}
.margin-pct {
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 38px;
  text-align: right;
}

/* ── Top Products ── */
.top-product-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s;
}
.top-product-row:hover {
  background: #fdf5f5;
}
.top-product-row--last {
  border-bottom: none;
}
.rank-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #f0f0f0;
  color: #888;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.top-product-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8b0000, #c62828);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.top-product-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.top-product-meta {
  font-size: 0.72rem;
  color: #999;
  margin: 0;
}
.top-product-val {
  font-size: 0.88rem;
  font-weight: 800;
  color: #8b0000;
  white-space: nowrap;
}

/* ── Quick Stats ── */
.qs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid #f5f5f5;
}
.qs-row:last-child {
  border-bottom: none;
}
.qs-label {
  font-size: 0.82rem;
  color: #666;
}
.qs-val {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1a1a1a;
}
</style>
