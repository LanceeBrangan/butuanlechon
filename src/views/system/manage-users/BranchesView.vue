<script setup>
import BranchesTable from '@/components/system/manage-users/BranchesTable.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(mobile.value ? false : true)
</script>

<template #content>
  <v-container>
    <v-card class="mb-5">
      <template #title>
        <span class="text-h6 font-weight-bold">
          <v-breadcrumbs :items="['User Management', 'List of Branches']">
            <template #prepend>
              <v-icon icon="mdi-store" size="small" class="me-1"></v-icon>
            </template>
          </v-breadcrumbs>
        </span>
      </template>

      <template #subtitle>
        <p class="ms-4 text-wrap">
          Manage branch locations and configure their names and addresses.
        </p>
      </template>
    </v-card>

    <v-card>
      <v-card-text>
        <BranchesTable></BranchesTable>
      </v-card-text>
    </v-card>
  </v-container>
</template>
