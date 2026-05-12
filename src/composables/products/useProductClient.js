import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'

export const getBranchId = async () => {
  const authStore = useAuthUserStore()

  if (!authStore.userData) await authStore.getUserInformation()
  if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

  // Super Admin is not branch-scoped
  if (authStore.userRole === 'Super Administrator') return null

  return authStore.authBranchIds[0] ?? null
}
