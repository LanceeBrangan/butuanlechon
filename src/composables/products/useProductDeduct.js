import { supabaseAdmin } from '@/utils/supabase'
import { products } from './useProductState'

export const deductProduct = async (productId, qty) => {
  try {
    const product = products.value.find((p) => String(p.id) === String(productId))
    if (!product || qty <= 0) return

    const newQuantity = Math.max(0, product.quantity - qty)

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('inv_id', productId)
      .select()

    if (error) throw error

    products.value = products.value.map((p) =>
      String(p.id) === String(productId)
        ? { ...p, quantity: newQuantity, totalPrice: newQuantity * p.price }
        : p,
    )

    return data
  } catch (e) {
    console.error('deductProduct:', e)
  }
}

export const deductMultipleProducts = async (usageArray) => {
  for (const u of usageArray) {
    const product = products.value.find((p) => String(p.id) === String(u.productId))
    if (product && u.quantity > 0) await deductProduct(u.productId, u.quantity)
  }
}
