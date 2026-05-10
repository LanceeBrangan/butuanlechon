<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/products/index.js'

import DashboardHeader           from '@/components/dashboard/DashboardHeader.vue'
import DashboardKpiCards         from '@/components/dashboard/DashboardKpiCards.vue'
import DashboardSalesReport      from '@/components/dashboard/DashboardSalesReport.vue'
import DashboardChart            from '@/components/dashboard/fields/DashboardChart.vue'
import DashboardTodayProducts    from '@/components/dashboard/fields/DashboardTodayProducts.vue'
import DashboardExpenseBreakdown from '@/components/dashboard/fields/DashboardExpenseBreakdown.vue'
import DashboardLowStock         from '@/components/dashboard/fields/DashboardLowStock.vue'
import DashboardEndDay           from '@/components/dashboard/dialog/DashboardEndDay.vue'
import DashboardDateDialog       from '@/components/dashboard/dialog/DashboardDateDialog.vue'

const router = useRouter()

const {
  products, lowStockProducts, currentSimulatedDate,
  todayReport, profitToday, todayProducts,
  setTodaySales, setBusinessDate, endDay,
} = useProducts()

const datePickerDialog = ref(false)

const formattedDate = computed(() =>
  new Date(currentSimulatedDate.value).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

const handleStatClick = (title) => {
  if (title === 'Total Products') router.push('/daily-usage')
  if (title === 'Low Stock Items') router.push('/reports/stocks')
}
</script>

<template>
  <div class="dash-bg">
    <v-container fluid class="pa-6 pa-md-8">

      <DashboardHeader
        :formatted-date="formattedDate"
        @change-date="datePickerDialog = true"
      />

      <DashboardKpiCards
        :total-products="products.length"
        :low-stock-count="lowStockProducts.length"
        :today-sales="todayReport.sales"
        :profit-today="profitToday"
        @stat-click="handleStatClick"
      />

      <v-row dense>
        <v-col cols="12" lg="8">
          <DashboardSalesReport
            :today-report="todayReport"
            :profit-today="profitToday"
            :formatted-date="formattedDate"
            @update-sales="setTodaySales"
          />
          <DashboardChart
            :today-report="todayReport"
            :profit-today="profitToday"
          />
          <DashboardTodayProducts :products="todayProducts" />
        </v-col>

        <v-col cols="12" lg="4">
          <DashboardExpenseBreakdown
            :today-report="todayReport"
            :profit-today="profitToday"
          />
          <DashboardLowStock :products="lowStockProducts" />
          <DashboardEndDay
            :today-report="todayReport"
            :profit-today="profitToday"
            @confirm="endDay"
          />
        </v-col>
      </v-row>

    </v-container>

    <DashboardDateDialog
      v-model="datePickerDialog"
      :current-date="currentSimulatedDate"
      @confirm="setBusinessDate"
    />
  </div>
</template>

<style scoped>
.dash-bg {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
</style>
