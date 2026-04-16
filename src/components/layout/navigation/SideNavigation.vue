<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'
import { mainNav } from './NavigationDrawer'

const router = useRouter()
const route = useRoute()
const authStore = useAuthUserStore()
const drawer = ref(true)
const isVisible = ref(false)

// Check authentication status
const checkAuth = async () => {
  const isAuth = await authStore.isAuthenticated()
  isVisible.value = isAuth && !['/', '/register'].includes(route.path)
}

// Watch for route changes
watch(() => route.path, checkAuth)

// Check auth status on component mount
onMounted(checkAuth)
</script>

<template>
  <template v-if="isVisible">
    <v-navigation-drawer :model-value="drawer" class="nav-drawer-red" permanent>
      <!-- Navigation Items -->
      <v-list nav>
        <v-list-item
          v-for="([title, icon, to], i) in mainNav"
          :key="i"
          class="nav-item"
          link
          :prepend-icon="icon"
          :title="title"
          :to="to"
        />
      </v-list>
    </v-navigation-drawer>
  </template>
</template>

<style scoped>
/* Navigation Drawer - Red Theme */
.nav-drawer-red {
  background: linear-gradient(180deg, #1a0505 0%, #2d0a0a 100%) !important;
  border-right: 1px solid rgba(139, 0, 0, 0.3) !important;
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh !important;
  z-index: 1000;
}

/* App Bar - Red Theme */
.app-bar-red {
  background: linear-gradient(90deg, #8b0000 0%, #a52a2a 100%) !important;
  box-shadow: 0 2px 12px rgba(139, 0, 0, 0.3) !important;
}

.app-bar-title {
  color: white !important;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Red Divider */
.red-divider {
  border-color: rgba(220, 20, 60, 0.3) !important;
  border-width: 2px;
  margin: 16px 0;
}

/* Navigation Items */
.nav-item {
  color: #ffe4e1 !important;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 6px 12px !important;
}

.nav-item:hover {
  background: rgba(139, 0, 0, 0.35) !important;
}

.nav-item-active {
  background: rgba(220, 20, 60, 0.3) !important;
  border-left: 5px solid #dc143c !important;
  font-weight: 700;
  color: white !important;
}

.nav-item-active :deep(.v-icon) {
  color: #dc143c !important;
  transform: scale(1.1);
}

/* Navigation Icons */
.nav-item :deep(.v-icon) {
  color: #ffb6b6 !important;
  transition: all 0.3s ease;
}

.nav-item:hover :deep(.v-icon) {
  color: #ff6b6b !important;
}

/* List Item Title */
.nav-item :deep(.v-list-item-title) {
  font-weight: 500;
  letter-spacing: 0.3px;
  font-size: 0.95rem;
}

/* Search Box */
.search-box {
  background: rgba(255, 255, 255, 0.2) !important;
  padding: 10px 20px;
  margin: 0 60px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.search-box:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5);
}

.search-input {
  color: white;
  background: none;
  border: none;
  width: 100%;
  outline: none;
  font-size: 0.95rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.85);
  opacity: 1;
}

/* Avatar Button */
.v-btn :deep(.v-avatar) {
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.v-btn:hover :deep(.v-avatar) {
  border-color: white;
  transform: scale(1.05);
}

/* App Bar Icons */
.app-bar-red :deep(.v-icon),
.app-bar-red :deep(.v-btn) {
  color: white !important;
}
</style>
