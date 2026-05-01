<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'

const route = useRoute()

// Show AppLayout only for authenticated routes
const showAppLayout = computed(() => {
  return route.meta.requiresAuth !== false
})
</script>

<template>
  <AppLayout v-if="showAppLayout" :is-with-app-bar-nav-icon="true">
    <template #content>
      <RouterView />
    </template>
  </AppLayout>
  <RouterView v-else />
</template>
