import { createRouter, createWebHistory } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

// Views
import ReportView from '@/views/auth/ReportView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProductView from '@/views/ProductView.vue'
import DailyUsage from '@/views/DailyUsage.vue'
import AccountSettings from '@/views/system/AccountSettings.vue'
import ConfirmView from '@/views/system/ConfirmView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        guestOnly: true,
        requiresNavigation: true,
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: {
        guestOnly: true,
        requiresNavigation: true,
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: {
        guestOnly: true,
        requiresNavigation: true,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
        role: 'Manager',
      },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductView,
      meta: {
        requiresAuth: true,
        role: 'Manager',
      },
    },
    {
      path: '/daily-usage',
      name: 'daily-usage',
      component: DailyUsage,
      meta: {
        requiresAuth: true,
        role: 'Manager',
      },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportView,
      meta: {
        requiresAuth: true,
        role: 'Manager',
      },
    },
    {
      path: '/account/settings',
      name: 'account-settings',
      component: AccountSettings,
      meta: {
        requiresAuth: true,
        role: 'Staff, Cashier, Admin',
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    }

  ],
})

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthUserStore()
  const isAuthenticated = await authStore.isAuthenticated()
  const userRole = authStore.user?.role

  // Handle 404 - Redirect invalid routes
  if (to.matched.length === 0) return next('/')

  //  Block direct URL access to certain pages (must navigate from app)
  if (to.meta.requiresNavigation && !from.name) return next('/')

  // 1️⃣ Block unauthenticated users from protected routes
  if (to.meta.requiresAuth && !isAuthenticated) return next('/')

  // 2️⃣ Block authenticated users from guest-only routes
  if (to.meta.guestOnly && isAuthenticated) {
    return next('/dashboard')
  }

  next()
})

export default router
