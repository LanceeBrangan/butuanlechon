<script setup>
import UsersTable from '@/components/system/manage-users/UsersTable.vue'
</script>
<template>
  <v-container>
    <v-card class="mb-5">
      <template #title>
        <span class="text-h6 font-weight-bold">
          <v-breadcrumbs :items="['User Management', 'List of Users']">
            <template #prepend>
              <v-icon icon="mdi-account-multiple" size="small" class="me-1"></v-icon>
            </template>
          </v-breadcrumbs>
        </span>
      </template>

      <template #subtitle>
        <p class="ms-4 text-wrap">Manage user accounts and assign roles dynamically.</p>
      </template>
    </v-card>

    <v-card>
      <v-card-text>
        <UsersTable></UsersTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
