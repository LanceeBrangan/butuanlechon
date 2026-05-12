import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'

export function useInventory() {
  const authStore = useAuthUserStore()

  // ✅ All operations use supabase (user JWT) — RLS handles role permissions:
  // Super Admin: full CRUD | Branch Manager: full CRUD own branch
  // Staff: SELECT + INSERT + UPDATE own branch | Cashier: SELECT only

  const fetchInventory = async () => {
    return await supabase
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

  // ✅ addItem uses supabase — RLS "Staff - inventory insert" and
  // "Branch Manager - inventory insert" policies control who can insert
  const addItem = async (item) => {
    return await supabase.from('inventory').insert({
      item_name: item.name,
      description: item.description,
      category_id: item.category_id,
      unit: item.unit,
      quantity: item.quantity,
      expiry_date: item.expiry_date,
      added_by: authStore.userData?.id,
    })
  }

  // ✅ updateQuantity uses supabase — RLS "Staff - inventory update" allows this
  const updateQuantity = async (inv_id, qty) => {
    return await supabase
      .from('inventory')
      .update({ quantity: qty })
      .eq('inv_id', inv_id)
  }

  return { fetchInventory, addItem, updateQuantity }
}
