import { ref, computed } from 'vue'
import { supabase, supabaseAdmin } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'

/* ================= GLOBAL STATE ================= */
const products = ref([])
const currentSimulatedDate = ref(new Date().toISOString().split('T')[0])
const todayKey = () => currentSimulatedDate.value
const dailyReports = ref({})

const getTodayReport = () => {
  const date = todayKey()
  if (!dailyReports.value[date]) {
    dailyReports.value[date] = { sales: 0, expenses: 0 }
  }
  return dailyReports.value[date]
}

/* ================= COMPUTED ================= */
const lowStockProducts = computed(() => products.value.filter((p) => p.quantity <= 10))
const todayReport = computed(() => getTodayReport())
const profitToday = computed(() => todayReport.value.sales - todayReport.value.expenses)
const todayProducts = computed(() => {
  const today = todayKey()
  return products.value.filter((p) => p.purchaseDate === today)
})

/* ================= COMPOSABLE ================= */
export function useProducts() {
  const authStore = useAuthUserStore()

  // ✅ Role-based client
  const getClient = () =>
    authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase

  const fetchProducts = async () => {
    try {
      const { data, error } = await getClient()
        .from('inventory')
        .select('*')
        .order('item_name', { ascending: true })

      if (error) throw error

      const mappedData = (data || []).map((item) => ({
        id: item.inv_id,
        name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        totalPrice: item.quantity * item.price,
        purchaseDate: item.purchase_date || currentSimulatedDate.value,
        initialQuantity: item.quantity,
      }))

      products.value = mappedData
      return mappedData
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  const addProduct = async (product, customDate = null) => {
    try {
      const purchaseDate = customDate || todayKey()
      const totalPrice = product.totalPrice || product.quantity * product.price

      // ✅ Inventory inserts always use supabaseAdmin
      const { data, error } = await supabaseAdmin
        .from('inventory')
        .insert([{
          item_name: product.name,
          quantity: product.quantity,
          unit: product.unit || 'piece(s)',
          price: product.price,
          purchase_date: purchaseDate,
        }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const newProduct = {
          id: data[0].inv_id,
          name: data[0].item_name,
          quantity: data[0].quantity,
          unit: data[0].unit,
          price: data[0].price,
          totalPrice: totalPrice,
          purchaseDate: purchaseDate,
          initialQuantity: data[0].quantity,
        }
        products.value.push(newProduct)

        if (!dailyReports.value[purchaseDate]) {
          dailyReports.value[purchaseDate] = { sales: 0, expenses: 0 }
        }
        dailyReports.value[purchaseDate].expenses += totalPrice
      }

      return data
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const updateProduct = async (updated) => {
    try {
      const oldProduct = products.value.find((p) => p.id === updated.id)
      const newTotalPrice = updated.totalPrice || updated.quantity * updated.price

      const { data, error } = await supabaseAdmin
        .from('inventory')
        .update({
          item_name: updated.name,
          quantity: updated.quantity,
          unit: updated.unit,
          price: updated.price,
        })
        .eq('inv_id', updated.id)
        .select()

      if (error) throw error

      const index = products.value.findIndex((p) => p.id === updated.id)
      if (index !== -1) {
        if (oldProduct && oldProduct.purchaseDate) {
          const purchaseDate = oldProduct.purchaseDate
          if (!dailyReports.value[purchaseDate]) {
            dailyReports.value[purchaseDate] = { sales: 0, expenses: 0 }
          }
          const report = dailyReports.value[purchaseDate]
          report.expenses -= oldProduct.totalPrice
          report.expenses += newTotalPrice
        }

        if (updated._additionalExpense && updated._addedOnDate) {
          const addedOnDate = updated._addedOnDate
          if (!dailyReports.value[addedOnDate]) {
            dailyReports.value[addedOnDate] = { sales: 0, expenses: 0 }
          }
          dailyReports.value[addedOnDate].expenses += updated._additionalExpense
        }

        products.value[index] = {
          ...updated,
          purchaseDate: oldProduct?.purchaseDate,
          totalPrice: newTotalPrice,
        }
      }

      return data
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const deleteProduct = async (id) => {
    try {
      const product = products.value.find((p) => p.id === id)

      const { error } = await supabaseAdmin.from('inventory').delete().eq('inv_id', id)
      if (error) throw error

      if (product && product.purchaseDate) {
        if (!dailyReports.value[product.purchaseDate]) {
          dailyReports.value[product.purchaseDate] = { sales: 0, expenses: 0 }
        }
        dailyReports.value[product.purchaseDate].expenses -= product.totalPrice
      }

      products.value = products.value.filter((p) => p.id !== id)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const deductProduct = async (productId, qty) => {
    try {
      const product = products.value.find((p) => p.id === productId)
      if (!product || qty <= 0) return

      const newQuantity = Math.max(0, product.quantity - qty)

      // ✅ Staff can deduct — use role-based client
      const { data, error } = await getClient()
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('inv_id', productId)
        .select()

      if (error) throw error
      product.quantity = newQuantity
      return data
    } catch (error) {
      console.error('Error deducting product:', error)
    }
  }

  const deductMultipleProducts = async (usageArray) => {
    try {
      for (const u of usageArray) {
        const product = products.value.find((p) => p.id === u.productId)
        if (product && u.quantity > 0) await deductProduct(u.productId, u.quantity)
      }
    } catch (error) {
      console.error('Error deducting multiple products:', error)
    }
  }

  const setTodaySales = (amount) => {
    const report = getTodayReport()
    report.sales = Number(amount) || 0
  }

  const setBusinessDate = (newDate) => {
    currentSimulatedDate.value = newDate
  }

  const saveDailyReport = async () => {
    const today = todayKey()
    const report = getTodayReport()

    try {
      const { data, error } = await supabaseAdmin
        .from('daily_reports')
        .insert([{
          report_date: today,
          sales: report.sales,
          expenses: report.expenses,
          profit: report.sales - report.expenses,
        }])
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving daily report:', error)
    }
  }

  const endDay = async () => {
    const today = todayKey()
    await saveDailyReport()
    const nextDate = new Date(today)
    nextDate.setDate(nextDate.getDate() + 1)
    currentSimulatedDate.value = nextDate.toISOString().split('T')[0]
  }

  const allReports = computed(() => {
    return Object.entries(dailyReports.value)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        expenses: data.expenses,
        profit: data.sales - data.expenses,
      }))
  })

  return {
    products, lowStockProducts, currentSimulatedDate,
    fetchProducts, addProduct, updateProduct, deleteProduct,
    setBusinessDate, deductProduct, deductMultipleProducts,
    todayReport, profitToday, todayProducts,
    setTodaySales, dailyReports, allReports, endDay,
  }
}
