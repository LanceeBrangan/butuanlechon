<script setup>
defineProps({
  totalProducts: { type: Number, default: 0 },
  lowStockCount: { type: Number, default: 0 },
  todaySales:    { type: Number, default: 0 },
  profitToday:   { type: Number, default: 0 },
})
defineEmits(['stat-click'])
</script>

<template>
  <v-row class="mb-6" dense>
    <v-col cols="12" sm="6" lg="3">
      <div class="kpi-card kpi-blue" style="cursor:pointer" @click="$emit('stat-click', 'Total Products')">
        <div class="kpi-icon-wrap"><v-icon size="24" color="white">mdi-package-variant</v-icon></div>
        <p class="kpi-label">Total Products</p>
        <p class="kpi-value">{{ totalProducts }}</p>
        <p class="kpi-sub">items in inventory</p>
      </div>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <div class="kpi-card kpi-red" style="cursor:pointer" @click="$emit('stat-click', 'Low Stock Items')">
        <div class="kpi-icon-wrap"><v-icon size="24" color="white">mdi-alert-circle-outline</v-icon></div>
        <p class="kpi-label">Low Stock Items</p>
        <p class="kpi-value">{{ lowStockCount }}</p>
        <p class="kpi-sub">need restocking</p>
      </div>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <div class="kpi-card kpi-green">
        <div class="kpi-icon-wrap"><v-icon size="24" color="white">mdi-cash-multiple</v-icon></div>
        <p class="kpi-label">Today's Sales</p>
        <p class="kpi-value">₱{{ todaySales.toLocaleString() }}</p>
        <p class="kpi-sub">revenue today</p>
      </div>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <div class="kpi-card" :class="profitToday >= 0 ? 'kpi-teal' : 'kpi-orange'">
        <div class="kpi-icon-wrap">
          <v-icon size="24" color="white">{{ profitToday >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
        </div>
        <p class="kpi-label">Net Profit</p>
        <p class="kpi-value">₱{{ profitToday.toLocaleString() }}</p>
        <p class="kpi-sub">{{ profitToday >= 0 ? 'profit today' : 'loss today' }}</p>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
.kpi-card {
  border-radius: 14px; padding: 20px 22px; color: #fff;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 18px rgba(0,0,0,0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.16); }
.kpi-card::after {
  content: ''; position: absolute; right: -20px; top: -20px;
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
}
.kpi-blue   { background: linear-gradient(135deg, #1565c0, #1976d2); }
.kpi-red    { background: linear-gradient(135deg, #7b0000, #c62828); }
.kpi-green  { background: linear-gradient(135deg, #1b5e20, #388e3c); }
.kpi-teal   { background: linear-gradient(135deg, #00695c, #00897b); }
.kpi-orange { background: linear-gradient(135deg, #e65100, #f57c00); }
.kpi-icon-wrap {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.18);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.kpi-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; opacity: 0.8; margin: 0 0 4px; }
.kpi-value { font-size: 1.7rem; font-weight: 800; margin: 0 0 2px; line-height: 1; }
.kpi-sub   { font-size: 0.72rem; opacity: 0.7; margin: 0; }
</style>
