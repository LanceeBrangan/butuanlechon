<script setup>
defineProps({
  products: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="section-card" v-if="products.length > 0">
    <div class="section-card-header">
      <div class="d-flex align-center ga-2">
        <v-icon size="18" color="#8b0000">mdi-shopping-outline</v-icon>
        <span class="section-card-title">Purchased Today</span>
      </div>
      <v-chip size="small" color="error" variant="tonal">{{ products.length }}</v-chip>
    </div>
    <div class="section-card-body pa-0">
      <div
        v-for="(product, i) in products"
        :key="product.id"
        class="today-row"
        :class="{ 'today-row--last': i === products.length - 1 }"
      >
        <div class="today-avatar">{{ product.name.charAt(0).toUpperCase() }}</div>
        <div class="flex-grow-1">
          <p class="today-name">{{ product.name }}</p>
          <p class="today-meta">{{ product.quantity }} {{ product.unit }}</p>
        </div>
        <span class="today-price">₱{{ product.totalPrice.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
.section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.section-card-title { font-size: 0.9rem; font-weight: 700; color: #1a1a1a; }
.today-row { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #f5f5f5; transition: background 0.15s; }
.today-row:hover { background: #fdf5f5; }
.today-row--last { border-bottom: none; }
.today-avatar {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #8b0000, #c62828);
  color: #fff; font-size: 0.85rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.today-name  { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; margin: 0; }
.today-meta  { font-size: 0.75rem; color: #888; margin: 0; }
.today-price { font-size: 0.9rem; font-weight: 700; color: #8b0000; white-space: nowrap; }
</style>
