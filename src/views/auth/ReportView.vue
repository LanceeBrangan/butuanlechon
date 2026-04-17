<script setup>
import { onMounted, ref } from 'vue'
import { useReportsStore } from '@/composables/reports'

const reportsStore = useReportsStore()
const selected = ref([])
const loading = ref(false)
const deleteDialog = ref(false)
const deleteAllDialog = ref(false)

onMounted(() => {
  reportsStore.getDailyReports()
})

async function deleteSelected() {
  if (selected.value.length === 0) return

  loading.value = true
  try {
    await reportsStore.deleteDailyReports(selected.value.map((r) => r.id))
    selected.value = []
    deleteDialog.value = false
    await reportsStore.getDailyReports()
  } catch (error) {
    console.error('Error deleting reports:', error)
  } finally {
    loading.value = false
  }
}

async function deleteAll() {
  loading.value = true
  try {
    await reportsStore.deleteAllDailyReports()
    selected.value = []
    deleteAllDialog.value = false
    await reportsStore.getDailyReports()
  } catch (error) {
    console.error('Error deleting all reports:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app-background">
    <v-container class="pa-8">
      <div class="d-flex justify-space-between align-center mb-6">
        <h1>Reports</h1>


      </div>

      <v-table>
        <thead>
          <tr>
            <th style="width: 50px">
              <v-checkbox
                :model-value="
                  selected.length === reportsStore.dailyReports.length &&
                  reportsStore.dailyReports.length > 0
                "
                :indeterminate="
                  selected.length > 0 && selected.length < reportsStore.dailyReports.length
                "
                hide-details
                @update:model-value="selected = $event ? [...reportsStore.dailyReports] : []"
              />
            </th>
            <th>Date</th>
            <th>Sales</th>
            <th>Expenses</th>
            <th>Profit</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in reportsStore.dailyReports" :key="r.report_date">
            <td>
              <v-checkbox
                :model-value="selected.includes(r)"
                hide-details
                @update:model-value="
                  $event ? selected.push(r) : selected.splice(selected.indexOf(r), 1)
                "
              />
            </td>
            <td>{{ r.report_date }}</td>
            <td>₱{{ r.sales.toLocaleString() }}</td>
            <td>₱{{ r.expenses.toLocaleString() }}</td>
            <td :style="{ color: r.profit >= 0 ? 'green' : 'red' }">
              ₱{{ r.profit.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Delete Selected Dialog -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <v-card-title>Delete Selected Reports</v-card-title>
          <v-card-text>
            Are you sure you want to delete {{ selected.length }} report(s)? This action cannot be
            undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="deleteDialog = false" :disabled="loading">Cancel</v-btn>
            <v-btn color="error" @click="deleteSelected" :loading="loading">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete All Dialog -->
      <v-dialog v-model="deleteAllDialog" max-width="500">
        <v-card>
          <v-card-title>Delete All Reports</v-card-title>
          <v-card-text>
            Are you sure you want to delete ALL {{ reportsStore.dailyReports.length }} reports? This
            action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="deleteAllDialog = false" :disabled="loading">Cancel</v-btn>
            <v-btn color="error" @click="deleteAll" :loading="loading">Delete All</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.app-background {
  min-height: 100vh;
}

.gap-2 {
  gap: 8px;
}
</style>
