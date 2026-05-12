import { createRouter, createWebHistory } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'
import { supabase } from '@/utils/supabase'
import { routes } from './routes'
import { utils } from 'xlsx'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

let sessionRefreshed = false  // reset on logout, see below

router.beforeEach(async (to) => {
  const authStore = useAuthUserStore()

  // ✅ FIX: Force JWT refresh ONCE per app load, BEFORE reading anything.
  // This ensures the custom_access_token_hook has fired and claims are present.
  if (!sessionRefreshed) {
    await supabase.auth.refreshSession()
    sessionRefreshed = true
  }

  // Step 1 — check session (now reads the freshly-hydrated session)
  const isLoggedIn = await authStore.isAuthenticated()

  if (to.name === 'home') {
    return isLoggedIn ? { name: 'dashboard' } : { name: 'login' }
  }

  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  if (!isLoggedIn && to.meta.requiresAuth) {
    return { name: 'login' }
  }

  if (isLoggedIn) {
    if (!authStore.userData) await authStore.getUserInformation()

    if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

    const isSuperAdmin = authStore.userRole === 'Super Administrator'

    if (!isSuperAdmin) {
      const roleName = authStore.userData?.user_role || authStore.userData?.role
      if (authStore.authPages.length === 0 && roleName) {
        await authStore.getAuthPages(roleName)
      }

      const isAccessible = authStore.authPages.includes(to.path)
      if (!isAccessible && !to.meta.isDefault) {
        return { name: 'forbidden' }
      }
    }
  }
})

// ✅ IMPORTANT: Reset the flag on logout so the next login gets a fresh refresh
// Call this wherever you handle sign-out:
// sessionRefreshed = false  ← put this in your logout action
// At the bottom of router/index.js — replace the last line with:

export function resetSessionFlag() {
  sessionRefreshed = false
}

export default router
