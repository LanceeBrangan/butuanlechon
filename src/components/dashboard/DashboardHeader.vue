<script setup>
defineProps({
  formattedDate: { type: String, default: '' },
})
defineEmits(['change-date'])
</script>

<template>
  <div class="top-bar mb-8">
    <div class="top-bar-left">
      <div class="top-bar-icon">
        <v-icon size="26" color="white">mdi-view-dashboard</v-icon>
      </div>
      <div>
        <p class="top-eyebrow">Inventory System</p>
        <h1 class="top-title">Dashboard</h1>
      </div>
    </div>
    <div class="top-bar-right">
      <div class="date-badge">
        <v-icon size="15" class="mr-1" style="color: #8b0000">mdi-calendar-today</v-icon>
        <span class="date-badge-text">{{ formattedDate }}</span>
        <v-btn size="x-small" variant="tonal" color="error" class="ml-3" rounded="lg" @click="$emit('change-date')">
          <v-icon size="13" start>mdi-pencil</v-icon>Change
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  background: linear-gradient(120deg, #7b0000 0%, #b71c1c 60%, #c62828 100%);
  border-radius: 16px;
  padding: 20px 28px;
  box-shadow: 0 4px 24px rgba(139, 0, 0, 0.2);
}
.top-bar-left { display: flex; align-items: center; gap: 14px; }
.top-bar-icon {
  width: 46px; height: 46px;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.top-eyebrow {
  color: rgba(255,255,255,0.6);
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase; margin: 0;
}
.top-title { color: #fff; font-size: 1.6rem; font-weight: 800; margin: 0; letter-spacing: -0.3px; }
.date-badge {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.92);
  border-radius: 10px; padding: 8px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.date-badge-text { font-size: 0.82rem; font-weight: 600; color: #333; }
</style>
