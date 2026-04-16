<script setup>
import { supabase, formActionDefault } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { getAvatarText } from '@/utils/helpers'
import { useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'

// Router setup
const router = useRouter()
const route = useRoute()

// Store setup
const authStore = useAuthUserStore()

// Add visibility control
const isVisible = ref(false)

// Check authentication and update visibility
const checkAuth = async () => {
  const isAuth = await authStore.isAuthenticated()
  isVisible.value = isAuth && !['/', '/register'].includes(route.path)
}

// Watch for route changes
watch(() => route.path, checkAuth)

// Check auth status on component mount
onMounted(checkAuth)

// Display setup for responsive design
const { xs, sm, mdAndUp } = useDisplay()
const tab = ref(null)

// Show/hide navigation based on screen size
const showNavigation = computed(() => {
  return mdAndUp.value
})

const isCompact = computed(() => xs.value || sm.value)

// Mobile menu control
const formAction = ref({ ...formActionDefault })
const mobileDrawer = ref(false)
const searchQuery = ref('')

// Logout handler
const onLogout = async () => {
  formAction.value = { ...formActionDefault, formProcess: true }

  await supabase.auth.signOut()

  formAction.value.formProcess = false

  setTimeout(() => {
    authStore.$reset()
  }, 2500)

  router.replace('/')
}

// Add mobile navigation items for drawer
const drawerItems = computed(() => [
  { title: 'Account Settings', icon: 'mdi-wrench', to: '/account/settings' },
  { title: 'Logout', icon: 'mdi-logout', to: null, action: onLogout },
])
</script>

<template>
  <template v-if="isVisible">
    <v-app-bar elevation="1" color="red-darken-3" class="app">
      <!-- Logo -->
      <v-app-bar-title class="title" :class="{ 'text-subtitle-1': isCompact }">
        BL & SG Administrative Panel
      </v-app-bar-title>


      <!-- Profile Menu -->
      <v-menu min-width="280px" rounded offset="5" transition="scale-transition">
        <template #activator="{ props }">
          <v-btn icon v-bind="props" class="profile-btn">
            <v-avatar class="user-avatar" size="42 ">
              <v-img
                v-if="authStore.userData.image_url"
                :src="authStore.userData.image_url"
                alt="User Avatar"
              />
              <span v-else class="text-h6 font-weight-bold">
                {{
                  getAvatarText(authStore.userData.firstname + ' ' + authStore.userData.lastname)
                }}
              </span>
            </v-avatar>
          </v-btn>
        </template>

        <v-card class="mt-1 profile-menu">
          <v-card-text class="pa-4">
            <v-list>
              <v-list-item
                :subtitle="authStore.userData.email"
                :title="authStore.userData.firstname + ' ' + authStore.userData.lastname"
              >
                <template #prepend>
                  <v-avatar class="user-avatar-large" size="56" color="red-darken-2">
                    <v-img
                      v-if="authStore.userData.image_url"
                      :src="authStore.userData.image_url"
                      alt="User Avatar"
                    />
                    <span v-else class="text-h5">
                      {{
                        getAvatarText(
                          authStore.userData.firstname + ' ' + authStore.userData.lastname,
                        )
                      }}
                    </span>
                  </v-avatar>
                </template>
              </v-list-item>
            </v-list>
              <v-chip class="mt-2 role-chip" label>
              {{ authStore.userRole }}
            </v-chip>

            <v-divider class="my-3"></v-divider>

            <v-btn
              block

              prepend-icon="mdi-wrench"
              variant="tonal"
              class="menu-btn mb-2"
              to="/account/settings"

            >
              Account Settings
            </v-btn>

            <v-btn
              block
              prepend-icon="mdi-logout"
              variant="tonal"
              class="menu-btn"
              @click="onLogout"
              :loading="formAction.formProcess"
              :disabled="formAction.formProcess"
            >
              Logout
            </v-btn>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="mobileDrawer" temporary location="left" v-if="!showNavigation">
      <v-list>
        <v-list-item
          v-for="item in drawerItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="item.action ? item.action() : null"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
</template>

<style scoped>
.title {
  font-size: 1.5rem;
  font-weight: 600;
}
.profile-btn {
  background-color: #f4f5ee;
  transition: all 0.3s ease;
}
.profile-btn:hover {
  color: #f4f5ee;
  transform: translateY(-2px);
}

.user-avatar span {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
  letter-spacing: 1px;
  font-weight: 600;
}

.v-btn {
  color: #c57e65;
  font-weight: 500;
  transition: all 0.3s ease;
}


.profile-menu {
  border-radius: 12px;
  overflow: hidden;
}

.menu-btn {
  height: 44px;
  font-weight: 500;
  border-radius: 2px;
  text-transform: none;
}

.role-chip {
  width: 100%;
  justify-content: center;
  background-color: #97a88eea;
  font-weight: 600;
}

</style>
