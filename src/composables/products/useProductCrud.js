import { useAuthUserStore } from '@/stores/authUser'
import { getBranchId } from './useProductClient'
import { supabase } from '@/utils/supabase'
import { products, currentSimulatedDate, dailyReports } from './useProductState'

// ✅ All operations use supabase (user JWT) — RLS handles permissions
// supabaseAdmin is never used here; it bypasses RLS and has no user JWT

export const fetchProducts = async () => {
  try {
    const authStore = useAuthUserStore()
    let query = supabase.from('inventory').select('*').order('purchase_date', { ascending: false })

    if (authStore.userRole !== 'Super Administrator') {
      const branchId = await getBranchId()
      if (!branchId) {
        products.value = []
        return []
      }
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query
    if (error) throw error

    products.value = (data || []).map((item) => {
      const purchaseDate = item.purchase_date || currentSimulatedDate.value
      const shelfLifeDays = item.shelf_life_days ?? null

      let expiryDate = null
      if (shelfLifeDays && purchaseDate) {
        const d = new Date(purchaseDate)
        d.setDate(d.getDate() + shelfLifeDays)
        expiryDate = d.toISOString().split('T')[0]
      }

      return {
        id: item.inv_id,
        name: item.item_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        price: Number(item.price),
        totalPrice: Number(item.quantity) * Number(item.price),
        purchaseDate,
        initialQuantity: Number(item.quantity),
        shelfLifeDays,
        expiryDate,
      }
    })

    return products.value
  } catch (e) {
    console.error('fetchProducts:', e)
    return []
  }
}

export const addProduct = async (product, customDate = null) => {
  try {
    const authStore = useAuthUserStore()
    const purchaseDate = customDate || currentSimulatedDate.value
    const isSuperAdmin = authStore.userRole === 'Super Administrator'

    const branch_id = product.branch_id || (await getBranchId())

    if (!branch_id) {
      console.error('No branch_id available for adding product')
    }

    const existing = products.value.find(
      (p) => p.name.toLowerCase() === product.name.toLowerCase()
    )

    if (existing) {
      const oldTotalValue = Number(existing.quantity) * Number(existing.price)
      const newTotalValue = Number(product.quantity) * Number(product.price)
      const newQuantity = Number(existing.quantity) + Number(product.quantity)
      const avgPrice = (oldTotalValue + newTotalValue) / newQuantity

      return await updateProduct({
        ...existing,
        quantity: newQuantity,
        price: avgPrice,
        totalPrice: newQuantity * avgPrice,
        _additionalExpense: newTotalValue,
        _addedOnDate: purchaseDate,
      })
    }

    const { data, error } = await supabase  // ✅ was getClient()
      .from('inventory')
      .insert([
        {
          item_name: product.name,
          quantity: product.quantity,
          unit: product.unit || 'piece(s)',
          price: product.price,
          purchase_date: purchaseDate,
          branch_id,
          created_by: authStore.userData?.id,
          shelf_life_days: product.shelfLifeDays || null,
        },
      ])
      .select()

    if (error) throw error

    if (data && data.length > 0) {
      const shelfLifeDays = product.shelfLifeDays || null
      let expiryDate = null
      if (shelfLifeDays && purchaseDate) {
        const d = new Date(purchaseDate)
        d.setDate(d.getDate() + shelfLifeDays)
        expiryDate = d.toISOString().split('T')[0]
      }

      products.value.push({
        id: data[0].inv_id,
        name: data[0].item_name,
        quantity: Number(data[0].quantity),
        unit: data[0].unit,
        price: Number(data[0].price),
        totalPrice: Number(data[0].quantity) * Number(data[0].price),
        purchaseDate,
        initialQuantity: Number(data[0].quantity),
        shelfLifeDays,
        expiryDate,
      })

      if (!dailyReports.value[purchaseDate]) {
        dailyReports.value[purchaseDate] = { sales: 0, expenses: 0 }
      }
      dailyReports.value[purchaseDate].expenses +=
        Number(product.quantity) * Number(product.price)
    }

    return data
  } catch (e) {
    console.error('Error adding product:', e)
  }
}

export const updateProduct = async (updated) => {
  try {
    const oldProduct = products.value.find((p) => p.id === updated.id)
    const newTotalPrice = updated.totalPrice || updated.quantity * updated.price

    const { data, error } = await supabase  // ✅ was getClient()
      .from('inventory')
      .update({
        item_name: updated.name,
        quantity: updated.quantity,
        unit: updated.unit,
        price: updated.price,
        shelf_life_days: updated.shelfLifeDays ?? null,
      })
      .eq('inv_id', updated.id)
      .select()

    if (error) throw error

    const index = products.value.findIndex((p) => p.id === updated.id)
    if (index !== -1) {
      if (oldProduct?.purchaseDate) {
        const r = (dailyReports.value[oldProduct.purchaseDate] ??= { sales: 0, expenses: 0 })
        r.expenses -= oldProduct.totalPrice
        r.expenses += newTotalPrice
      }
      if (updated._additionalExpense && updated._addedOnDate) {
        const r = (dailyReports.value[updated._addedOnDate] ??= { sales: 0, expenses: 0 })
        r.expenses += updated._additionalExpense
      }
      products.value[index] = {
        ...updated,
        purchaseDate: oldProduct?.purchaseDate,
        totalPrice: newTotalPrice,
      }
    }

    return data
  } catch (e) {
    console.error('updateProduct:', e)
  }
}

export const deleteProduct = async (id) => {
  try {
    const product = products.value.find((p) => p.id === id)
    const { error } = await supabase  // ✅ was getClient()
      .from('inventory')
      .delete()
      .eq('inv_id', id)
    if (error) throw error

    if (product?.purchaseDate) {
      const r = (dailyReports.value[product.purchaseDate] ??= { sales: 0, expenses: 0 })
      r.expenses -= product.totalPrice
    }
    products.value = products.value.filter((p) => p.id !== id)
  } catch (e) {
    console.error('deleteProduct:', e)
  }
}
