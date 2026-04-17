<script setup>
import UserRoleList from '@/components/system/manage-users/UserRoleList.vue'
</script>

<template>
  <v-container>
    <v-card class="mb-5">
      <template #title>
        <span class="text-h6 font-weight-bold">
          <v-breadcrumbs :items="['User Management', 'User Roles']">
            <template #prepend>
              <v-icon icon="mdi-tag-multiple" size="small" class="me-1"></v-icon>
            </template>
          </v-breadcrumbs>
        </span>
      </template>

      <template #subtitle>
        <p class="ms-4 text-wrap">
          A role grants access to specific pages and features, ensuring that admin users can
          access what they need based on their assigned role.
        </p>
      </template>
    </v-card>

    <UserRoleList></UserRoleList>
  </v-container>
</template>
