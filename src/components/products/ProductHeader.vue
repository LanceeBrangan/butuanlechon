<script setup>
import { ref } from 'vue'

const props = defineProps({
  totalCount: { type: Number, default: 0 },
  lowStockCount: { type: Number, default: 0 },
  currentDate: { type: String, default: '' },
})

const emit = defineEmits(['add', 'refresh'])

const isRefreshing = ref(false)

const handleRefresh = async () => {
  isRefreshing.value = true
  await emit('refresh')
  setTimeout(() => { isRefreshing.value = false }, 500)
}
</script>

<template>
  <!-- Header -->
  <div class="header-bar mb-8">
    <div class="header-inner px-6 px-md-10 py-5">
      <div class="d-flex align-center justify-space-between flex-wrap ga-4">
        <div class="d-flex align-center ga-4">
          <div class="header-icon-wrap">
            <v-icon size="28" color="white">mdi-package-variant</v-icon>
          </div>
          <div>
            <p class="header-eyebrow">Inventory Management</p>
            <h1 class="header-title">Product Inventory</h1>
          </div>
        </div>

        <div class="d-flex align-center ga-3 flex-wrap">
          <v-btn class="action-header-btn" variant="flat" rounded="lg" @click="$emit('add')">
            <v-icon start size="18">mdi-plus</v-icon>
            Add Product
          </v-btn>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Row -->
  <v-row class="mb-6" dense>
    <v-col cols="12" sm="4">
      <div class="stat-card">
        <div class="stat-icon-wrap stat-blue">
          <v-icon size="22" color="white">mdi-archive-outline</v-icon>
        </div>
        <div>
          <p class="stat-label">Total Products</p>
          <p class="stat-value">{{ totalCount }}</p>
        </div>
      </div>
    </v-col>
    <v-col cols="12" sm="4">
      <div class="stat-card">
        <div class="stat-icon-wrap stat-red">
          <v-icon size="22" color="white">mdi-alert-circle-outline</v-icon>
        </div>
        <div>
          <p class="stat-label">Low Stock Items</p>
          <p class="stat-value">{{ lowStockCount }}</p>
        </div>
      </div>
    </v-col>
    <v-col cols="12" sm="4">
      <div class="stat-card">
        <div class="stat-icon-wrap stat-green">
          <v-icon size="22" color="white">mdi-calendar-today</v-icon>
        </div>
        <div>
          <p class="stat-label">Business Date</p>
          <p class="stat-value stat-value--sm">{{ currentDate }}</p>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.header-bar {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(139, 0, 0, 0.18);
}
.header-inner {
  background: linear-gradient(120deg, #7b0000 0%, #b71c1c 60%, #c62828 100%);
}
.header-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.header-eyebrow {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0;
}
.header-title {
  color: #fff;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin: 0;
}
.action-header-btn {
  background: rgba(255, 255, 255, 0.95) !important;
  color: #8b0000 !important;
  font-weight: 700 !important;
  font-size: 0.875rem !important;
  text-transform: none !important;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.2s ease;
}
.action-header-btn:hover {
  background: #fff !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-1px);
}
.refresh-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}
.refresh-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12) !important;
}
.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
}
.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-blue { background: linear-gradient(135deg, #1565c0, #1976d2); }
.stat-red  { background: linear-gradient(135deg, #8b0000, #c62828); }
.stat-green{ background: linear-gradient(135deg, #2e7d32, #388e3c); }
.stat-label {
  color: #888;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 2px;
}
.stat-value {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
}
.stat-value--sm { font-size: 1.05rem; }
</style>
