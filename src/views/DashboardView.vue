<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'
import { useProducts } from '@/composables/useProducts'
import Chart from 'chart.js/auto'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()

const authStore = useAuthUserStore()



// Get all product state and methods from composable
const {
  products,
  lowStockProducts,
  currentSimulatedDate,
  todayReport,
  profitToday,
  todayProducts,
  setTodaySales,
  setBusinessDate,
  endDay,
  allReports,
} = useProducts()

// Local state
const lowStockDialog = ref(false)
const datePickerDialog = ref(false)
const endDayDialog = ref(false)
const tempDate = ref(null)
let chartInstance = null

// Computed: total products
const totalProducts = computed(() => products.value.length)

// Stats for cards
const stats = computed(() => [
  {
    title: 'Total Products',
    value: totalProducts.value,
    clickable: true,
    icon: 'mdi-package-variant',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Low Stock Items',
    value: lowStockProducts.value.length,
    clickable: true,
    icon: 'mdi-alert-circle',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
])

// Format date for display
const formattedDate = computed(() => {
  const date = new Date(currentSimulatedDate.value)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Dialog handlers
const openLowStockDialog = () => {
  if (lowStockProducts.value.length > 0) {
    lowStockDialog.value = true
  }
}

const handleStatClick = (stat) => {
  if (stat.title === 'Total Products') {
    router.push('/daily-usage')
  } else if (stat.title === 'Low Stock Items') {
    openLowStockDialog()
  }
}

const openDatePicker = () => {
  tempDate.value = new Date(currentSimulatedDate.value)
  datePickerDialog.value = true
}

const confirmDateChange = () => {
  if (tempDate.value) {
    // Ensure proper date handling without timezone issues
    let dateToUse = tempDate.value
    if (typeof dateToUse === 'string') {
      // Already in YYYY-MM-DD format from the date picker
      setBusinessDate(dateToUse)
    } else if (dateToUse instanceof Date) {
      // Convert Date object to YYYY-MM-DD using local timezone
      const year = dateToUse.getFullYear()
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0')
      const day = String(dateToUse.getDate()).padStart(2, '0')
      const newDate = `${year}-${month}-${day}`
      setBusinessDate(newDate)
    }
    datePickerDialog.value = false
  }
}

// Sales input handler
const handleSalesInput = (value) => {
  setTodaySales(Number(value) || 0)
}

// End day handler
const openEndDayDialog = () => {
  endDayDialog.value = true
}

const confirmEndDay = async () => {
  endDayDialog.value = false
  await endDay()
}

// Chart setup
const setupChart = () => {
  const ctx = document.getElementById('dailyChart')
  if (!ctx) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sales', 'Expenses', 'Profit'],
      datasets: [
        {
          label: 'Amount (₱)',
          data: [todayReport.value.sales, todayReport.value.expenses, profitToday.value],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            profitToday.value >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            profitToday.value >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return '₱' + value.toLocaleString()
            },
          },
        },
      },
    },
  })
}

// Watch for changes in report data to update chart
watch(
  [todayReport, profitToday],
  () => {
    if (chartInstance) {
      chartInstance.data.datasets[0].data = [
        todayReport.value.sales,
        todayReport.value.expenses,
        profitToday.value,
      ]
      chartInstance.data.datasets[0].backgroundColor[2] =
        profitToday.value >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 159, 64, 0.6)'
      chartInstance.data.datasets[0].borderColor[2] =
        profitToday.value >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)'
      chartInstance.update()
    }
  },
  { deep: true },
)

// Initialize chart on mount
onMounted(() => {
  setTimeout(() => {
    setupChart()
  }, 100)
})

const handleLogout = () => router.push('/')
</script>

<template>
  <AppLayout :is-with-app-bar-nav-icon="true">
    <template #content>
      <div class="app-background">
        <v-container class="pa-8">
          <!-- Current Date Display -->
          <v-alert type="info" variant="tonal" class="mb-4" prominent>
            <template #prepend>
              <v-icon>mdi-calendar-today</v-icon>
            </template>
            <div class="d-flex justify-space-between align-center">
              <div><strong>Current Business Date:</strong> {{ formattedDate }}</div>
              <v-btn color="primary" variant="elevated" size="small" @click="openDatePicker">
                <v-icon start>mdi-calendar-edit</v-icon>
                Change Date
              </v-btn>
            </div>
          </v-alert>

          <h1 class="dashboard-title mb-8">Dashboard</h1>

          <!-- Statistics Cards -->
          <v-row class="mb-6 stats-container pa-8 rounded-xl">
            <v-col cols="12" md="6" lg="6" v-for="stat in stats" :key="stat.title">
              <v-card
                class="stat-card pa-8 rounded-xl"
                elevation="4"
                height="180"
                :style="{ cursor: stat.clickable ? 'pointer' : 'default' }"
                @click="stat.clickable ? handleStatClick(stat) : null"
              >
                <div class="d-flex justify-space-between align-center h-100">
                  <div>
                    <h2 class="text-h3 font-weight-bold stat-value mb-3">
                      {{ stat.value.toLocaleString() }}
                    </h2>
                    <p class="text-h6 stat-label mb-0">
                      {{ stat.title }}
                    </p>
                  </div>
                  <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
                    <v-icon size="40" color="white">
                      {{ stat.icon }}
                    </v-icon>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- DAILY SALES REPORT -->
          <v-card class="pa-6 mt-8 rounded-xl" elevation="4">
            <h2 class="mb-4">Daily Sales Report - {{ formattedDate }}</h2>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  label="Sales Today"
                  type="number"
                  prefix="₱"
                  variant="outlined"
                  :model-value="todayReport.sales"
                  @update:model-value="handleSalesInput"

                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="Expenses Today"
                  prefix="₱"
                  variant="outlined"
                  :model-value="todayReport.expenses.toLocaleString()"
                  readonly
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="Profit Today"
                  prefix="₱"
                  variant="outlined"
                  :model-value="profitToday.toLocaleString()"
                  readonly
                  :color="profitToday >= 0 ? 'green' : 'red'"
                />
              </v-col>
            </v-row>
          </v-card>

          <!-- Chart -->
          <v-card class="pa-6 mt-8 rounded-xl" elevation="4">
            <h2 class="mb-4">Profit vs Expenses (Today)</h2>
            <canvas id="dailyChart" height="120"></canvas>
          </v-card>

          <!-- Products Purchased Today -->
          <v-card v-if="todayProducts.length > 0" class="pa-6 mt-8 rounded-xl" elevation="4">
            <h2 class="mb-4">Products Purchased Today</h2>
            <v-list>
              <v-list-item v-for="product in todayProducts" :key="product.id">
                <template #prepend>
                  <v-icon color="primary">mdi-package-variant</v-icon>
                </template>
                <v-list-item-title>{{ product.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Qty: {{ product.quantity }} {{ product.unit }} | Price: ₱{{
                    product.totalPrice.toLocaleString()
                  }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- End Day Button -->
          <v-btn
            class="mt-4"
            color="red-darken-2"
            variant="elevated"
            size="large"
            block
            @click="openEndDayDialog"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            End Day & Advance to Next
          </v-btn>

          <!-- Low Stock Dialog -->
          <v-dialog v-model="lowStockDialog" max-width="600px">
            <v-card>
              <v-card-title class="text-h6 bg-red-darken-2 text-white">
                <v-icon start color="white">mdi-alert-circle</v-icon>
                Low Stock Products
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4">
                <v-list v-if="lowStockProducts.length > 0">
                  <v-list-item v-for="product in lowStockProducts" :key="product.id">
                    <template #prepend>
                      <v-avatar color="orange">
                        <v-icon color="white">mdi-alert</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ product.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Qty: {{ product.quantity }} {{ product.unit }} (Low Stock!)
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p v-else class="text-center text-grey">All products have sufficient stock.</p>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="elevated" color="red-darken-2" @click="lowStockDialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Date Picker Dialog -->
          <v-dialog v-model="datePickerDialog" max-width="400px">
            <v-card>
              <v-card-title class="text-h6 bg-red-darken-2 text-white">
                <v-icon start color="white">mdi-calendar-edit</v-icon>
                Change Business Date
              </v-card-title>
              <v-card-text class="pa-6">
                <v-date-picker
                  v-model="tempDate"
                  color="red-darken-2"
                  show-adjacent-months
                  elevation="0"
                />
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn text @click="datePickerDialog = false">Cancel</v-btn>
                <v-btn color="red-darken-2" variant="elevated" @click="confirmDateChange">
                  Confirm
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- End Day Confirmation Dialog -->
          <v-dialog v-model="endDayDialog" max-width="400px">
            <v-card>
              <v-card-title class="text-h6 bg-red-darken-2 text-white">
                <v-icon start color="white">mdi-calendar-check</v-icon>
                End Day
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-6">
                <p class="mb-0">
                  <strong>Are you sure you want to end this day and advance to the next?</strong>
                </p>
                <p class="text-caption text-grey mt-2 mb-0">
                  This will save today's sales report (Sales: ₱{{ todayReport.sales.toLocaleString() }} | Expenses: ₱{{ todayReport.expenses.toLocaleString() }})
                </p>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn text @click="endDayDialog = false">Cancel</v-btn>
                <v-btn color="red-darken-2" variant="elevated" @click="confirmEndDay">
                  <v-icon start>mdi-check</v-icon>
                  Confirm End Day
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
.app-background {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%);
  min-height: 100vh;
}
.dashboard-title {
  color: #8b0000;
  font-size: 2.5rem;
  font-weight: 700;
}
.stats-container {
  background: linear-gradient(135deg, #8b0000 0%, #b22222 100%);
}
.stat-card {
  background: white;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-4px);
}
.stat-value {
  color: #8b0000;
}
.stat-label {
  color: #666;
}
.stat-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
