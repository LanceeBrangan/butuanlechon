import { products, lowStockProducts, currentSimulatedDate, todayReport, profitToday, todayProducts, dailyReports } from './useProductState'
import { fetchProducts, addProduct, updateProduct, deleteProduct } from './useProductCrud'
import { deductProduct, deductMultipleProducts } from './useProductDeduct'
import { setTodaySales, setBusinessDate, saveDailyReport, endDay, allReports } from './useProductReports'

export function useProducts() {
  return {
    products, lowStockProducts, currentSimulatedDate,
    todayReport, profitToday, todayProducts, dailyReports, allReports,
    fetchProducts, addProduct, updateProduct, deleteProduct,
    deductProduct, deductMultipleProducts,
    setTodaySales, setBusinessDate, saveDailyReport, endDay,
  }
}
