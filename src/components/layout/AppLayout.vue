<script setup>
import SideNavigation from './navigation/SideNavigation.vue'
import TopProfileHeader from '@/components/layout/navigation/TopProfileHeader.vue'
import { ref, onMounted, watch } from 'vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthUserStore()

const isLoggedIn = ref(false)
const isMobileLogged = ref(false)
const isDesktop = ref(false)
const loading = ref(true)

const checkAuthStatus = async () => {
  isLoggedIn.value = await authStore.isAuthenticated()
  const isResetPasswordPage = route.path === '/reset-password'
  isMobileLogged.value = isLoggedIn.value && (route.path === '/' || route.path === '/register')
  isDesktop.value = isLoggedIn.value && !isMobileLogged.value && !isResetPasswordPage
  loading.value = false

  if (isLoggedIn.value && route.path === '/') {
    router.replace('/dashboard')
  }
}

watch(() => route.path, checkAuthStatus)

onMounted(async () => {
  await checkAuthStatus()
})
</script>

<template>
  <v-app>
    <!-- Navigation Drawer - shown when logged in (except on reset password page) -->
    <keep-alive>
      <SideNavigation v-if="isLoggedIn"></SideNavigation>
    </keep-alive>

    <!-- Top Profile Header -->
    <TopProfileHeader v-if="isLoggedIn"></TopProfileHeader>

    <!-- Main Content -->
    <v-main>
      <slot name="content"></slot>
    </v-main>
  </v-app>
</template>
