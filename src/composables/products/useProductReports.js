import { computed } from 'vue'
import { getClient, getBranchId } from './useProductClient'
import { todayKey, dailyReports, getTodayReport, currentSimulatedDate } from './useProductState'

export const setTodaySales = (amount) => {
  getTodayReport().sales = Number(amount) || 0
}

export const setBusinessDate = (newDate) => {
  currentSimulatedDate.value = newDate
}

export const saveDailyReport = async () => {
  const today = todayKey()
  const report = getTodayReport()
  const branch_id = await getBranchId()
  if (!branch_id) { console.error('No branch_id for report'); return }

  try {
    const { data, error } = await getClient()
      .from('daily_reports')
      .insert([{ report_date: today, sales: report.sales, expenses: report.expenses, profit: report.sales - report.expenses, branch_id }])
      .select()

    if (error) throw error
    return data
  } catch (e) { console.error('saveDailyReport:', e) }
}

export const endDay = async () => {
  await saveDailyReport()
  const next = new Date(todayKey())
  next.setDate(next.getDate() + 1)
  currentSimulatedDate.value = next.toISOString().split('T')[0]
}

export const allReports = computed(() =>
  Object.entries(dailyReports.value)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, data]) => ({ date, sales: data.sales, expenses: data.expenses, profit: data.sales - data.expenses }))
)
