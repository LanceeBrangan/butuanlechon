import { supabase, supabaseAdmin } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserRolesStore = defineStore('userRoles', () => {
  const authStore = useAuthUserStore()
  const userRoles = ref([])

  function $reset() {
    userRoles.value = []
  }

  // ✅ Read uses supabase (user JWT) — RLS "All users - View user roles" allows authenticated reads
  async function getUserRoles() {
    const { data } = await supabase
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .order('user_role', { ascending: true })

    userRoles.value = data ?? []
  }

  // ✅ Writes use supabase — RLS "Super Admin - Manage user roles" restricts to Super Admin only
  async function addUserRole(formData) {
    const { pages, ...roleData } = formData
    const { data, error } = await supabase.from('user_roles').insert([roleData]).select()
    if (error) return { data, error }
    await updateUserRolePages(data[0].id, pages)
    return { data, error }
  }

  async function updateUserRole(formData) {
    const { pages, ...roleData } = formData
    const { data, error } = await supabase
      .from('user_roles')
      .update(roleData)
      .eq('id', roleData.id)
      .select()
    if (error) return { data, error }
    await updateUserRolePages(formData.id, pages)
    return { data, error }
  }

  async function deleteUserRole(id) {
    return await supabase.from('user_roles').delete().eq('id', id)
  }

  async function updateUserRolePages(id, pages) {
    const { error: deleteError } = await supabase
      .from('user_role_pages')
      .delete()
      .eq('user_role_id', id)

    if (deleteError) return { error: deleteError }

    const pageData = pages.map((page) => ({ page, user_role_id: id }))
    const { data, error: insertError } = await supabase
      .from('user_role_pages')
      .insert(pageData)
      .select()

    return { data, error: insertError }
  }

  return { userRoles, $reset, getUserRoles, addUserRole, updateUserRole, deleteUserRole }
})
