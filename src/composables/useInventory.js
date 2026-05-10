import { supabase, supabaseAdmin } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'

export function useInventory() {
  const authStore = useAuthUserStore()

  // ✅ Role-based client
  const getClient = () =>
    authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase

  const fetchInventory = async () => {
    return await getClient()
      .from('inventory')
      .select(`
        inv_id,
        item_name,
        quantity,
        unit,
        expiry_date,
        categories ( name ),
        users ( firstname, lastname )
      `)
      .order('date_added', { ascending: false })
  }

  // ✅ Writes use supabaseAdmin — staff can insert their own usage
  // but only admins can add inventory items
  const addItem = async (item) => {
    return await supabaseAdmin.from('inventory').insert({
      item_name: item.name,
      description: item.description,
      category_id: item.category_id,
      unit: item.unit,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
      added_by: authStore.userData?.id,   // ✅ fixed: was user.value.id which would crash
    })
  }

  const updateQuantity = async (inv_id, qty) => {
    // ✅ Staff can update quantity (daily usage) — use role-based client
    return await getClient()
      .from('inventory')
      .update({ quantity: qty })
      .eq('inv_id', inv_id)
  }

  return { fetchInventory, addItem, updateQuantity }
}
