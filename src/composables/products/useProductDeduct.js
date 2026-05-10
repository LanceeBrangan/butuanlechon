import { getClient } from './useProductClient'
import { products } from './useProductState'

export const deductProduct = async (productId, qty) => {
  try {
    const product = products.value.find((p) => p.id === productId)
    if (!product || qty <= 0) return

    const newQuantity = Math.max(0, product.quantity - qty)
    const { data, error } = await getClient()
      .from('inventory').update({ quantity: newQuantity }).eq('inv_id', productId).select()

    if (error) throw error
    product.quantity = newQuantity
    return data
  } catch (e) { console.error('deductProduct:', e) }
}

export const deductMultipleProducts = async (usageArray) => {
  for (const u of usageArray) {
    const product = products.value.find((p) => p.id === u.productId)
    if (product && u.quantity > 0) await deductProduct(u.productId, u.quantity)
  }
}
