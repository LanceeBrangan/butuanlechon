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
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: {
        guestOnly: true,
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
    },
    {
      path: '/confirmation',
      component: () => import('@/views/system/ConfirmView.vue'),
    }

  ],
})

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthUserStore()

  // Skip guard on initial route to allow login/register
  if (from.name === undefined && !to.meta.requiresAuth) {
    next()
    return
  }

  const isAuthenticated = await authStore.isAuthenticated()

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
    return
  }

  // If route is guest-only and user is authenticated
  if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
