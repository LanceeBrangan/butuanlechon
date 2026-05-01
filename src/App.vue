<script setup>
import { RouterView } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout :is-with-app-bar-nav-icon="true">
    <template #content>
      <RouterView />
    </template>
  </AppLayout>
</template>
