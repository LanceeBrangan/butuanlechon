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
      }

    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
        role: 'Admin',
      },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductView,
      meta: {
        requiresAuth: true,
        role: 'Admin',
      },
    },
    {
      path: '/daily-usage',
      name: 'daily-usage',
      component: DailyUsage,
      meta: {
        requiresAuth: true,
        role: 'Admin',
      },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportView,
    },
    {
      path: '/account/settings',
      name: 'account-settings',
      component: AccountSettings,
      meta: {
        requiresAuth: true,
        role: 'User',
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: {
        guestOnly: true,
      }
    }

  ],
})

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthUserStore()
  const isAuthenticated = await authStore.isAuthenticated()


  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/')
  }


  if (to.meta.guestOnly && isAuthenticated) {
    return next('/dashboard')
  }

  next()
})





export default router
