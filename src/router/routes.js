//auth
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

//Error
import ForbiddenView from '@/views/errors/ForbiddenView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'

//Default
import DashboardView from '@/views/DashboardView.vue'
import AccountSettings from '@/views/system/AccountSettings.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import PasswordResetView from '@/views/auth/PasswordResetView.vue'

//Users
import UserRolesView from '@/views/system/manage-users/UserRolesView.vue'
import UsersView from '@/views/system/manage-users/UsersView.vue'

//Product
import ProductView from '@/views/ProductView.vue'

//Expenses
import DailyUsage from '@/views/DailyUsage.vue'

const isDefaced = false

//Routes
export const routes = isDefaced
  ? [
      {
        path: '/',
        name: 'home',
      },
      {
        path: '/login',
        name: 'login',
        component: ForbiddenView,
        meta: { requiresAuth: false },
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: ForbiddenView,
        meta: { requiresAuth: true, isDefault: true },
      },
      //Error Pages
      {
        path: '/forbidden',
        name: 'forbidden',
        component: ForbiddenView,
        meta: { isDefault: true },
      },
      {
        path: '/:catchAll(.*)',
        name: 'not-found',
        component: NotFoundView,
        meta: { isDefault: true },
      },
    ]
  : [
      //Auth Pages
      {
        path: '/',
        name: 'home',
      },
      {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false },
      },
      {
        path: '/register',
        name: 'register',
        component: RegisterView,
        meta: { requiresAuth: false },
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, isDefault: true },
      },
      {
        path: '/account/settings',
        name: 'account-settings',
        component: AccountSettings,
        meta: { requiresAuth: true, isDefault: true },
      },
      // User Pages
      {
        path: '/manage/users/roles',
        name: 'manage-user-roles',
        component: UserRolesView,
        meta: { requiresAuth: true },
      },
      {
        path: '/manage/users',
        name: 'manage-users',
        component: UsersView,
        meta: { requiresAuth: true },
      },
      //Password Reset
      {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
        meta: { requiresAuth: false },
      },
      {
        path: '/password-reset',
        name: 'password-reset',
        component: PasswordResetView,
        meta: { requiresAuth: false },
      },

      //Products
      {
        path: '/products',
        name: 'products',
        component: ProductView,
        meta: { requiresAuth: true },
      },

      //Reports
      {
        path: '/daily-usage',
        name: 'daily-usage',
        component: DailyUsage,
        meta: { requiresAuth: true },
      },

      //Errors
      {
        path: '/forbidden',
        name: 'forbidden',
        component: ForbiddenView,
        meta: { isDefault: true },
      },
      {
        path: '/:catchAll(.*)',
        name: 'not-found',
        component: NotFoundView,
        meta: { isDefault: true },
      },
    ]
