import { supabase, supabaseAdmin } from '@/utils/supabase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthUserStore = defineStore('authUser', () => {
  const userData = ref(null)
  const authPages = ref([])
  const authBranchIds = ref([])

  const userRole = computed(() => {
    if (!userData.value) return 'No Role Assigned'
    if (userData.value?.is_admin) return 'Super Administrator'
    return userData.value?.user_role || userData.value?.role || 'No Role Assigned'
  })

  // ✅ Auth store helper — always reads based on role
  const getClient = () =>
    userRole.value === 'Super Administrator' ? supabaseAdmin : supabase

  function $reset() {
    userData.value = null
    authPages.value = []
    authBranchIds.value = []
  }

  async function isAuthenticated() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      const { id, email, user_metadata } = data.session.user
      userData.value = { id, email, ...user_metadata }
    }
    return !!data.session
  }

  async function getUserInformation() {
    const { data: { user: { id, email, user_metadata } } } = await supabase.auth.getUser()
    userData.value = { id, email, ...user_metadata }
  }

  async function getAuthPages(name) {
    if (!name) return
    // Always use supabaseAdmin here — called during login before role is confirmed
    const { data } = await supabaseAdmin
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .eq('user_role', name)

    if (data && data.length > 0 && data[0].pages) {
      authPages.value = data[0].pages.map((p) => p.page)
    }
  }

  async function getAuthBranchIds() {
    if (!userData.value?.branch) return
    // ✅ Use role-based client
    const { data } = await getClient()
      .from('branches')
      .select('id')
      .in('name', userData.value.branch.split(','))

    if (data) authBranchIds.value = data.map((b) => b.id)
  }

  // Auth operations always use supabase (not admin)
  async function updateUserInformation(updatedData) {
    const { data: { user: { id, email, user_metadata } }, error } =
      await supabase.auth.updateUser({ data: { ...updatedData } })

    if (error) return { error }
    if (user_metadata) {
      userData.value = { id, email, ...user_metadata }
      return { data: userData.value }
    }
  }

  async function updateUserImage(file) {
    if (!userData.value?.id) await getUserInformation()
    if (!userData.value?.id) return { error: { message: 'User not authenticated', status: 401 } }

    const filePath = `${userData.value.id}-avatar.png`

    try {
      const { data, error } = await supabase.storage
        .from('butuanlechon')
        .upload(filePath, file, { cacheControl: '0', upsert: true, contentType: file.type || 'image/png' })

      if (error) return { error: { message: error.message, status: error.status || 500 } }

      const timestamp = new Date().getTime()
      const { data: imageData } = supabase.storage.from('butuanlechon').getPublicUrl(filePath)
      const cacheBustedUrl = `${imageData.publicUrl}?t=${timestamp}`

      await new Promise(resolve => setTimeout(resolve, 200))
      return await updateUserInformation({ image_url: cacheBustedUrl })
    } catch (err) {
      return { error: { message: err.message, status: 500 } }
    }
  }

  return {
    userData, userRole, authPages, authBranchIds,
    $reset, isAuthenticated, getUserInformation,
    getAuthPages, getAuthBranchIds,
    updateUserInformation, updateUserImage,
  }
})
