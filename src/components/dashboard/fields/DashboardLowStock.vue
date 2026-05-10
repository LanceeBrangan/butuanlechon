<script setup>
import { ref } from 'vue'

defineProps({
  products: { type: Array, default: () => [] },
})

const dialog = ref(false)
</script>

<template>
  <div class="section-card mb-5">
    <div class="section-card-header">
      <div class="d-flex align-center ga-2">
        <v-icon size="18" color="error">mdi-alert-outline</v-icon>
        <span class="section-card-title">Low Stock Alerts</span>
      </div>
      <v-chip size="small" :color="products.length > 0 ? 'error' : 'success'" variant="tonal">
        {{ products.length > 0 ? products.length + ' items' : 'All good' }}
      </v-chip>
    </div>
    <div class="section-card-body pa-0">
      <div v-if="products.length > 0">
        <div
          v-for="(p, i) in products.slice(0, 5)" :key="p.id"
          class="ls-row"
          :class="{ 'ls-row--last': i === Math.min(products.length, 5) - 1 && products.length <= 5 }"
        >
          <v-icon size="16" color="orange" class="mr-2">mdi-alert</v-icon>
          <span class="ls-name">{{ p.name }}</span>
          <v-chip size="x-small" color="error" variant="flat" class="ml-auto">
            {{ p.quantity }} {{ p.unit }}
          </v-chip>
        </div>
        <div class="px-4 pb-3 pt-1" v-if="products.length > 5">
          <v-btn size="small" variant="text" color="error" block @click="dialog = true">
            +{{ products.length - 5 }} more
          </v-btn>
        </div>
      </div>
      <div v-else class="pa-6 text-center">
        <v-icon size="36" color="success" class="mb-2">mdi-check-circle-outline</v-icon>
        <p class="text-caption text-grey">All products have sufficient stock.</p>
      </div>
    </div>
  </div>

  <!-- Full Low Stock Dialog -->
  <v-dialog v-model="dialog" max-width="520px">
    <v-card rounded="xl" elevation="12" class="dlg-card">
      <div class="dlg-header px-6 py-5">
        <div class="d-flex align-center ga-3">
          <v-icon size="22" color="white">mdi-alert-circle</v-icon>
          <span class="dlg-title">Low Stock Products</span>
        </div>
      </div>
      <v-card-text class="px-6 py-4">
        <div
          v-for="(product, i) in products" :key="product.id"
          class="ls-row"
          :class="{ 'ls-row--last': i === products.length - 1 }"
        >
          <div class="ls-avatar">{{ product.name.charAt(0).toUpperCase() }}</div>
          <div class="flex-grow-1">
            <p class="ls-name mb-0">{{ product.name }}</p>
            <p class="text-caption text-grey mb-0">{{ product.unit }}</p>
          </div>
          <v-chip size="small" color="error" variant="flat">{{ product.quantity }} left</v-chip>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="error" rounded="lg" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.section-card-title { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
.ls-row { display: flex; align-items: center; gap: 10px; padding: 11px 20px; border-bottom: 1px solid #f5f5f5; transition: background 0.15s; }
.ls-row:hover { background: #fff9f9; }
.ls-row--last { border-bottom: none; }
.ls-avatar {
  width: 30px; height: 30px; border-radius: 8px;
  background: linear-gradient(135deg, #e53935, #ef9a9a);
  color: #fff; font-size: 0.78rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ls-name { font-size: 0.85rem; font-weight: 600; color: #1a1a1a; }
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-header { background: linear-gradient(120deg, #7b0000, #c62828); }
.dlg-title { color: #fff; font-size: 1.05rem; font-weight: 700; }
</style>
