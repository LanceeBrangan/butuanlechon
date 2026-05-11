import { ref, computed } from 'vue'

export const products = ref([])
export const currentSimulatedDate = ref(new Date().toISOString().split('T')[0])
export const todayKey = () => currentSimulatedDate.value
export const dailyReports = ref({})

export const lowStockProducts = computed(() => products.value.filter((p) => p.quantity <= 10))

// ✅ FIX Bug #2 — directly access currentSimulatedDate.value so Vue tracks it
export const todayReport = computed(() => {
  const date = currentSimulatedDate.value
  if (!dailyReports.value[date]) {
    dailyReports.value[date] = { sales: 0, expenses: 0 }
  }
  return dailyReports.value[date]
})

export const profitToday = computed(() => todayReport.value.sales - todayReport.value.expenses)

export const todayProducts = computed(() => {
  const today = currentSimulatedDate.value
  return products.value.filter((p) => p.purchaseDate === today)
})
