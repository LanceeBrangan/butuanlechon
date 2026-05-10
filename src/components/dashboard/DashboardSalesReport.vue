<script setup>
defineProps({
  todayReport:   { type: Object, default: () => ({ sales: 0, expenses: 0 }) },
  profitToday:   { type: Number, default: 0 },
  formattedDate: { type: String, default: '' },
})
defineEmits(['update-sales'])
</script>

<template>
  <div class="section-card mb-5">
    <div class="section-card-header">
      <div class="d-flex align-center ga-2">
        <v-icon size="18" color="#8b0000">mdi-chart-bar</v-icon>
        <span class="section-card-title">Daily Sales Report</span>
      </div>
      <span class="section-card-sub">{{ formattedDate }}</span>
    </div>
    <div class="section-card-body">
      <v-row dense>
        <v-col cols="12" md="4">
          <div class="report-field-wrap">
            <label class="report-field-label">
              <v-icon size="14" color="success" class="mr-1">mdi-cash-register</v-icon>
              Sales Today
            </label>
            <v-text-field
              type="number" prefix="₱" variant="outlined" density="comfortable" hide-details
              class="report-field"
              :model-value="todayReport.sales"
              @update:model-value="$emit('update-sales', $event)"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="report-field-wrap">
            <label class="report-field-label">
              <v-icon size="14" color="error" class="mr-1">mdi-cart-outline</v-icon>
              Expenses Today
            </label>
            <v-text-field
              prefix="₱" variant="outlined" density="comfortable" hide-details readonly
              class="report-field report-field--readonly"
              :model-value="todayReport.expenses.toLocaleString()"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="report-field-wrap">
            <label class="report-field-label">
              <v-icon size="14" :color="profitToday >= 0 ? 'teal' : 'orange'" class="mr-1">mdi-trending-up</v-icon>
              Net Profit
            </label>
            <v-text-field
              prefix="₱" variant="outlined" density="comfortable" hide-details readonly
              class="report-field"
              :class="profitToday >= 0 ? 'report-field--profit' : 'report-field--loss'"
              :model-value="profitToday.toLocaleString()"
            />
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.section-card-title { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
.section-card-sub { font-size: 0.75rem; color: #888; }
.section-card-body { padding: 20px; }
.report-field-wrap { display: flex; flex-direction: column; gap: 6px; }
.report-field-label { font-size: 0.73rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; }
.report-field :deep(.v-field) { border-radius: 10px; }
.report-field--readonly :deep(.v-field) { background: #fafafa; }
.report-field--profit :deep(.v-field input) { color: #2e7d32; font-weight: 700; }
.report-field--loss :deep(.v-field input) { color: #c62828; font-weight: 700; }
</style>
