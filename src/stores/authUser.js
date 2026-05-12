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

  // ✅ getAuthPages uses supabase (user JWT) — RLS policy allows all authenticated users to read user_roles
  async function getAuthPages(name) {
    if (!name) return
    const { data } = await supabase
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .eq('user_role', name)

    if (data && data.length > 0 && data[0].pages) {
      authPages.value = data[0].pages.map((p) => p.page)
    }
  }

  // ✅ getAuthBranchIds uses supabase (user JWT) — RLS allows authenticated users to read branches
  async function getAuthBranchIds() {
    if (!userData.value?.branch) {
      console.warn('[getAuthBranchIds] No branch in userData:', userData.value)
      return
    }

    const branchNames = userData.value.branch.split(',').map(b => b.trim())

    const { data, error } = await supabase
      .from('branches')
      .select('id')
      .in('name', branchNames)

    if (error) {
      console.error('[getAuthBranchIds] Query error:', error)
      return
    }

    console.log('[getAuthBranchIds] branchNames:', branchNames, '| matched:', data)
    authBranchIds.value = data?.map((b) => b.id) ?? []
  }

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
      // ✅ Storage uploads use supabaseAdmin — storage bucket policies require service role
      const { data, error } = await supabaseAdmin.storage
        .from('butuanlechon')
        .upload(filePath, file, { cacheControl: '0', upsert: true, contentType: file.type || 'image/png' })

      if (error) return { error: { message: error.message, status: error.status || 500 } }

      const timestamp = new Date().getTime()
      const { data: imageData } = supabaseAdmin.storage.from('butuanlechon').getPublicUrl(filePath)
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
