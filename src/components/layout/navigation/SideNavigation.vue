<script setup>
import {
  mainNav,
  menuItemsNav1,
  menuItemsNav2,
  menuItemsNav3,
} from './sideNavigation'
import { useAuthUserStore } from '@/stores/authUser'
import { ref, watch } from 'vue'

const props = defineProps(['isDrawerVisible'])
const authStore = useAuthUserStore()

const noAccessPages = ref([])
const editableMenuItemsNav1 = ref([...menuItemsNav1])
const editableMenuItemsNav2 = ref([...menuItemsNav2])
const editableMenuItemsNav3 = ref([...menuItemsNav3])

const onFilterPages = () => {
  // Reset every time so re-runs are clean
  noAccessPages.value = []
  editableMenuItemsNav1.value = [...menuItemsNav1]
  editableMenuItemsNav2.value = [...menuItemsNav2]
  editableMenuItemsNav3.value = [...menuItemsNav3]

  if (authStore.userRole === 'Super Administrator') return

  const menuItems = [
    { items: editableMenuItemsNav1, title: mainNav[0][0] }, // Products
    { items: editableMenuItemsNav2, title: mainNav[1][0] }, // Reports
    { items: editableMenuItemsNav3, title: mainNav[2][0] }, // User Management
  ]

  menuItems.forEach(({ items, title }) => {
    items.value = items.value.filter((item) => authStore.authPages.includes(item[3]))
    if (items.value.length === 0) noAccessPages.value.push(title)
  })
}

// Watch authPages length — fires when router guard populates it after refresh
// Also fires immediately if already populated (e.g. navigating between pages)
watch(
  () => authStore.authPages.length,
  () => onFilterPages(),
  { immediate: true }
)

// Also watch userRole in case it resolves after authPages
watch(
  () => authStore.userRole,
  () => onFilterPages(),
)
</script>

<template>
  <v-navigation-drawer permanent width="300" expand-on-hover rail>
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        to="/dashboard"
      ></v-list-item>

      <v-divider></v-divider>

      <template v-for="([title, icon], i) in mainNav" :key="i">
        <v-list-group v-if="!noAccessPages.includes(title)" fluid>
          <template #activator="{ props }">
            <v-list-item v-bind="props" :prepend-icon="icon" :title="title"></v-list-item>
          </template>

          <!-- Products -->
          <template v-if="title === mainNav[0][0]">
            <v-list-item
              v-for="([title, icon, subtitle, to], i) in editableMenuItemsNav1"
              :key="i"
              :prepend-icon="icon"
              :title="title"
              :subtitle="subtitle ?? undefined"
              :to="to ?? undefined"
            ></v-list-item>
          </template>

          <!-- Reports -->
          <template v-if="title === mainNav[1][0]">
            <v-list-item
              v-for="([title, icon, subtitle, to], i) in editableMenuItemsNav2"
              :key="i"
              :prepend-icon="icon"
              :title="title"
              :subtitle="subtitle ?? undefined"
              :to="to ?? undefined"
            ></v-list-item>
          </template>

          <!-- User Management -->
          <template v-if="title === mainNav[2][0]">
            <v-list-item
              v-for="([title, icon, subtitle, to], i) in editableMenuItemsNav3"
              :key="i"
              :prepend-icon="icon"
              :title="title"
              :subtitle="subtitle ?? undefined"
              :to="to ?? undefined"
            ></v-list-item>
          </template>
        </v-list-group>
      </template>

      <v-divider></v-divider>

      <v-list-item
        prepend-icon="mdi-wrench"
        title="Account Settings"
        to="/account/settings"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
