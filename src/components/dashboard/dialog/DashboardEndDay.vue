<script setup>
import { ref } from 'vue'

defineProps({
  todayReport: { type: Object, default: () => ({ sales: 0, expenses: 0 }) },
  profitToday: { type: Number, default: 0 },
})

const emit = defineEmits(['confirm'])
const dialog = ref(false)

const confirm = async () => {
  dialog.value = false
  emit('confirm')
}
</script>

<template>
  <!-- End Day Card -->
  <div class="section-card end-day-card">
    <div class="section-card-body text-center">
      <v-icon size="40" color="#8b0000" class="mb-3">mdi-calendar-check</v-icon>
      <p class="end-day-title mb-1">End of Day</p>
      <p class="end-day-sub mb-4">Save today's report and advance to the next business day.</p>
      <v-btn color="error" variant="flat" rounded="lg" block class="end-day-btn" @click="dialog = true">
        <v-icon start>mdi-calendar-arrow-right</v-icon>
        End Day & Advance
      </v-btn>
    </div>
  </div>

  <!-- Confirm Dialog -->
  <v-dialog v-model="dialog" max-width="440px">
    <v-card rounded="xl" elevation="12" class="dlg-card">
      <v-card-text class="px-8 pt-10 pb-6 text-center">
        <div class="end-icon-wrap mb-4">
          <v-icon size="36" color="#8b0000">mdi-calendar-check</v-icon>
        </div>
        <p class="end-dlg-title mb-2">End Today's Business Day?</p>
        <p class="text-body-2 text-grey mb-4">This will save today's report and advance the business date.</p>
        <div class="end-summary">
          <div class="end-summary-row">
            <span>Sales</span>
            <strong>₱{{ todayReport.sales.toLocaleString() }}</strong>
          </div>
          <div class="end-summary-row">
            <span>Expenses</span>
            <strong>₱{{ todayReport.expenses.toLocaleString() }}</strong>
          </div>
          <div class="end-summary-row">
            <span>Net Profit</span>
            <strong :style="{ color: profitToday >= 0 ? '#2e7d32' : '#c62828' }">
              ₱{{ profitToday.toLocaleString() }}
            </strong>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-8 pb-8 d-flex ga-3 justify-center">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" style="min-width:120px" @click="dialog = false">Cancel</v-btn>
        <v-btn variant="flat" color="error" rounded="lg" style="min-width:120px" class="font-weight-bold" @click="confirm">
          <v-icon start size="16">mdi-check</v-icon>Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.section-card-body { padding: 20px; }
.end-day-card { border: 2px dashed #ffcdd2 !important; background: #fff9f9 !important; }
.end-day-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; }
.end-day-sub { font-size: 0.8rem; color: #888; }
.end-day-btn { font-weight: 700 !important; text-transform: none !important; }
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.end-icon-wrap {
  width: 70px; height: 70px; background: #fff5f5; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; border: 2px solid #ffcdd2;
}
.end-dlg-title { font-size: 1.15rem; font-weight: 800; color: #1a1a1a; }
.end-summary { background: #f8f9fa; border-radius: 10px; padding: 12px 16px; border: 1px solid #eee; }
.end-summary-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 5px 0; border-bottom: 1px solid #eee; color: #444; }
.end-summary-row:last-child { border-bottom: none; }
.dlg-cancel-btn { color: #555 !important; border-color: #ddd !important; text-transform: none !important; font-weight: 600 !important; }
</style>
