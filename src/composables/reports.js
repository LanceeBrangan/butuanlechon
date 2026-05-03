import { getAccumulatedNumber, getISODate, getPreciseNumber, prepareDate } from '@/utils/helpers'
import { supabase, supabaseAdmin, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReportsStore = defineStore('reports', () => {
  const authStore = useAuthUserStore()

  const productsReport = ref([])
  const stocksReport = ref([])
  const salesReport = ref([])
  const dailyReports = ref([])

  // ✅ Role-based client
  const getClient = () =>
    authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase

  function $reset() {
    productsReport.value = []
    stocksReport.value = []
    salesReport.value = []
    dailyReports.value = []
  }

  async function getProductsReport(tableOptions, { product_id, branch_id, date }) {
    if (!date) return

    let query = getClient()
      .from('products')
      .select('id, name, image_url, description, stock_ins( qty, qty_reweighed, qty_metric, branch_id, is_segregated, is_portion, purchased_at ), sale_products( qty, branch_id, created_at )')
      .order('name', { ascending: true })

    if (branch_id)
      query = query.eq('stock_ins.branch_id', branch_id).eq('sale_products.branch_id', branch_id)

    if (product_id) query = query.eq('id', product_id)

    const { data } = await query
    productsReport.value = getProductsMap(data, { date })
  }

  function getProductsMap(data, { date }) {
    const formatDate = new Date(date)
    formatDate.setDate(formatDate.getDate() - 1)
    const previousDate = getISODate(formatDate)
    const todayDate = getISODate(new Date(date))

    return data.map((product) => {
      const totalInventory = getAccumulatedNumber(
        product.stock_ins.filter((stock) => stock.purchased_at <= todayDate && !stock.is_segregated && !stock.is_portion),
        'qty',
      )
      const totalStockIns = getAccumulatedNumber(
        product.stock_ins.filter((stock) => stock.purchased_at <= previousDate && stock.is_portion),
        'qty_reweighed',
      )
      const totalSales = getAccumulatedNumber(
        product.sale_products.filter((sale) => getISODate(sale.created_at) <= previousDate),
        'qty',
      )
      const stockInDuringDate = getAccumulatedNumber(
        product.stock_ins.filter((stock) => stock.purchased_at === todayDate && stock.is_portion),
        'qty_reweighed',
      )
      const stockSoldDuringDate = getAccumulatedNumber(
        product.sale_products.filter((sale) => getISODate(sale.created_at) === todayDate),
        'qty',
      )
      const qty_metric = product.stock_ins.length > 0 ? product.stock_ins[0].qty_metric : ''

      return {
        date: todayDate,
        name: product.name,
        image_url: product.image_url,
        description: product.description,
        stock_inventory: getPreciseNumber(totalInventory),
        stock_opening: getPreciseNumber(totalStockIns - totalSales),
        stock_in: getPreciseNumber(stockInDuringDate),
        stock_sold: getPreciseNumber(stockSoldDuringDate),
        stock_remaining: getPreciseNumber(totalStockIns - totalSales + stockInDuringDate - stockSoldDuringDate),
        qty_metric,
      }
    })
  }

  async function getStocksReport(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { column, order } = tablePagination(tableOptions, 'created_at', false)
    search = tableSearch(search)

    let query = getClient()
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description ), sale_products( qty )')
      .order(column, { ascending: order })
      .eq('is_segregated', false)

    query = await getStocksFilter(query, { search, product_id, branch_id, purchased_at })

    const { data } = await query
    stocksReport.value = data ?? []
  }

  async function getStocksFilter(query, { search, product_id, branch_id, purchased_at }) {
    if (search) {
      if (search.length >= 4 && !isNaN(search))
        query = query.or('id.eq.' + search + ', stock_in_id.eq.' + search)
      else
        query = query.or('supplier.ilike.%' + search + '%, remarks.ilike.%' + search + '%')
    }

    if (product_id) query = query.eq('product_id', product_id)

    if (branch_id) query = query.eq('branch_id', branch_id)
    else {
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()
      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (purchased_at) {
      if (purchased_at.length === 1)
        query = query.eq('purchased_at', prepareDate(purchased_at[0]))
      else
        query = query
          .gte('purchased_at', prepareDate(purchased_at[0]))
          .lte('purchased_at', prepareDate(purchased_at[purchased_at.length - 1]))
    }

    return query
  }

  async function getSalesReport(tableOptions, { customer_id, branch_id, created_at }) {
    const { column, order } = tablePagination(tableOptions, 'created_at', false)

    let query = getClient()
      .from('sales')
      .select('*, customers( customer ), branches( name ), sale_products( products(name, image_url), qty, discounted_price, unit_price, is_cash_discount, discount), customer_payments( payment, created_at )')
      .order(column, { ascending: order })

    query = await getSalesFilter(query, { customer_id, branch_id, created_at })

    const { data } = await query
    salesReport.value = data ?? []
  }

  async function getSalesFilter(query, { customer_id, branch_id, created_at }) {
    if (customer_id) query = query.eq('customer_id', customer_id)

    if (branch_id) query = query.eq('branch_id', branch_id)
    else {
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()
      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (created_at) {
      if (created_at.length === 1)
        query = query.eq('created_at', prepareDate(created_at[0]))
      else
        query = query
          .gte('created_at', prepareDate(created_at[0]))
          .lte('created_at', prepareDate(created_at[created_at.length - 1]))
    }

    return query
  }

  // ✅ daily_reports — Super Admin only writes, role-based reads
  async function getDailyReports() {
    try {
      const { data, error } = await getClient()
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false })

      if (error) throw error
      dailyReports.value = data || []
      return dailyReports.value
    } catch (error) {
      console.error('Error fetching daily reports:', error)
      return []
    }
  }

  async function deleteDailyReports(ids) {
    try {
      const { error } = await supabaseAdmin.from('daily_reports').delete().in('id', ids)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting daily reports:', error)
      throw error
    }
  }

  async function deleteAllDailyReports() {
    try {
      const { error } = await supabaseAdmin.from('daily_reports').delete().neq('id', 0)
      if (error) throw error
      dailyReports.value = []
      return true
    } catch (error) {
      console.error('Error deleting all daily reports:', error)
      throw error
    }
  }

  return {
    productsReport, stocksReport, salesReport, dailyReports,
    $reset, getProductsReport, getStocksReport, getSalesReport,
    getDailyReports, deleteDailyReports, deleteAllDailyReports,
  }
})
