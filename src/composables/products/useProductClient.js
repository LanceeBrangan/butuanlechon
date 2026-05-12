import { supabase, supabaseAdmin } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'

export const getClient = () => {
  const authStore = useAuthUserStore()
  return authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase
}

let sessionRefreshed = false

export const getBranchId = async () => {
  const authStore = useAuthUserStore()

  if (!authStore.userData) await authStore.getUserInformation()
  if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

  if (!sessionRefreshed) {
    await supabase.auth.refreshSession()
    sessionRefreshed = true
  }

  return authStore.authBranchIds[0] ?? null
}
