<script setup>
import TopProfileHeader from './navigation/TopProfileHeader.vue'
import SideNavigation from './navigation/SideNavigation.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isWithAppBarNavIcon'])

const emit = defineEmits(['isDrawerVisible', 'theme'])

// Utilize pre-defined vue functions
const { xs, sm, mobile } = useDisplay()

// Use Pinia Store
const authStore = useAuthUserStore()

// Load Variables
const isLoggedIn = ref(false)
const isMobileLogged = ref(false)
const isDesktop = ref(false)
const isDrawerVisible = ref(false)
const theme = ref(localStorage.getItem('theme') ?? 'light')

//  Toggle Theme
const onToggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
  emit('theme', theme.value)
}

// Load Functions during component rendering
onMounted(async () => {
  isLoggedIn.value = await authStore.isAuthenticated()
  isMobileLogged.value = mobile.value && isLoggedIn.value
  isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
})
</script>

<template>
  <v-responsive>
    <v-app>
      <v-app-bar color="red-darken-3" elevation="1">
        <v-app-bar-nav-icon
          v-if="props.isWithAppBarNavIcon && isLoggedIn"
          icon="mdi-menu"
          @click="isDrawerVisible = !isDrawerVisible"
        >
        </v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <TopProfileHeader v-if="isLoggedIn"></TopProfileHeader>
      </v-app-bar>

      <SideNavigation v-if="isLoggedIn" :isDrawerVisible="isDrawerVisible"></SideNavigation>

      <slot name="navigation"></slot>

      <v-main>
        <slot name="content"></slot>
      </v-main>

    </v-app>
  </v-responsive>
</template>
