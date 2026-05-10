<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/products/index.js'


const router = useRouter()
const isRefreshing = ref(false)
const searchQuery = ref('')
const filterLevel = ref('all') // 'all' | 'critical' | 'low'

const { products, lowStockProducts, fetchProducts } = useProducts()

onMounted(async () => {
  await fetchProducts()
})

const refreshStock = async () => {
  isRefreshing.value = true
  try {
    await fetchProducts()
  } finally {
    setTimeout(() => (isRefreshing.value = false), 500)
  }
}

// Stock level classification
const getStockLevel = (qty) => {
  if (qty <= 3) return 'critical'
  if (qty <= 10) return 'low'
  return 'ok'
}

const getStockColor = (qty) => {
  if (qty <= 3) return 'error'
  if (qty <= 10) return 'warning'
  return 'success'
}

const getStockLabel = (qty) => {
  if (qty <= 3) return 'Critical'
  if (qty <= 10) return 'Low'
  return 'OK'
}

const getStockBg = (qty) => {
  if (qty <= 3) return '#fff5f5'
  if (qty <= 10) return '#fffde7'
  return '#f1faf2'
}

const getStockBorder = (qty) => {
  if (qty <= 3) return '#ffcdd2'
  if (qty <= 10) return '#fff176'
  return '#a5d6a7'
}

// Filtered list
const filteredLowStock = computed(() => {
  let list = lowStockProducts.value

  if (filterLevel.value === 'critical') {
    list = list.filter((p) => p.quantity <= 3)
  } else if (filterLevel.value === 'low') {
    list = list.filter((p) => p.quantity > 3 && p.quantity <= 10)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q))
  }

  return list
})

const criticalCount = computed(() => lowStockProducts.value.filter((p) => p.quantity <= 3).length)
const lowCount = computed(
  () => lowStockProducts.value.filter((p) => p.quantity > 3 && p.quantity <= 10).length,
)

// Stock bar width (max 10 = full bar for low stock context)
const stockBarWidth = (qty) => {
  const max = 10
  return Math.min((qty / max) * 100, 100) + '%'
}
</script>

<template>
  <div class="stock-bg">
    <v-container fluid class="pa-6 pa-md-8">
      <!-- ── Header ── -->
      <div class="stock-header mb-8">
        <div class="stock-header-left">
          <v-btn icon variant="text" class="back-btn mr-2" @click="router.back()">
            <v-icon size="20">mdi-arrow-left</v-icon>
          </v-btn>
          <div class="header-icon-wrap">
            <v-icon size="26" color="white">mdi-alert-circle-outline</v-icon>
          </div>
          <div>
            <p class="header-eyebrow">Inventory Monitoring</p>
            <h1 class="header-title">Low Stock Alerts</h1>
          </div>
        </div>
        <div class="d-flex align-center ga-3">
          <v-btn
            icon
            variant="text"
            class="refresh-btn"
            :loading="isRefreshing"
            @click="refreshStock"
          >
            <v-icon size="20">mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="bottom">Refresh</v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- ── Summary Cards ── -->
      <v-row class="mb-6" dense>
        <v-col cols="12" sm="4">
          <div
            class="summary-card summary-card--red"
            @click="filterLevel = 'critical'"
            :class="{ 'summary-card--active': filterLevel === 'critical' }"
            style="cursor: pointer"
          >
            <div class="summary-icon-wrap">
              <v-icon size="22" color="white">mdi-alert-octagon-outline</v-icon>
            </div>
            <div>
              <p class="summary-label">Critical Stock</p>
              <p class="summary-value">{{ criticalCount }}</p>
              <p class="summary-sub">≤ 3 units remaining</p>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div
            class="summary-card summary-card--amber"
            @click="filterLevel = 'low'"
            :class="{ 'summary-card--active': filterLevel === 'low' }"
            style="cursor: pointer"
          >
            <div class="summary-icon-wrap">
              <v-icon size="22" color="white">mdi-alert-outline</v-icon>
            </div>
            <div>
              <p class="summary-label">Low Stock</p>
              <p class="summary-value">{{ lowCount }}</p>
              <p class="summary-sub">4 – 10 units remaining</p>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div
            class="summary-card summary-card--dark"
            @click="filterLevel = 'all'"
            :class="{ 'summary-card--active': filterLevel === 'all' }"
            style="cursor: pointer"
          >
            <div class="summary-icon-wrap">
              <v-icon size="22" color="white">mdi-package-variant</v-icon>
            </div>
            <div>
              <p class="summary-label">Total Flagged</p>
              <p class="summary-value">{{ lowStockProducts.length }}</p>
              <p class="summary-sub">items need attention</p>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- ── Table Card ── -->
      <div class="table-card">
        <!-- Card Header with search & filter -->
        <div class="table-card-header px-6 py-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <h2 class="table-card-title">Stock Alert List</h2>
              <v-chip
                size="small"
                :color="filteredLowStock.length > 0 ? 'error' : 'success'"
                variant="tonal"
              >
                {{ filteredLowStock.length }} items
              </v-chip>
            </div>

            <div class="d-flex align-center ga-3 flex-wrap">
              <!-- Filter chips -->
              <div class="d-flex ga-2">
                <v-chip
                  size="small"
                  :variant="filterLevel === 'all' ? 'flat' : 'tonal'"
                  :color="filterLevel === 'all' ? 'error' : 'default'"
                  @click="filterLevel = 'all'"
                  style="cursor: pointer"
                  >All</v-chip
                >
                <v-chip
                  size="small"
                  :variant="filterLevel === 'critical' ? 'flat' : 'tonal'"
                  :color="filterLevel === 'critical' ? 'error' : 'default'"
                  @click="filterLevel = 'critical'"
                  style="cursor: pointer"
                  >Critical</v-chip
                >
                <v-chip
                  size="small"
                  :variant="filterLevel === 'low' ? 'flat' : 'tonal'"
                  :color="filterLevel === 'low' ? 'warning' : 'default'"
                  @click="filterLevel = 'low'"
                  style="cursor: pointer"
                  >Low</v-chip
                >
              </div>

              <!-- Search -->
              <v-text-field
                v-model="searchQuery"
                placeholder="Search products..."
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                style="min-width: 200px; max-width: 260px"
                class="search-field"
                clearable
              />
            </div>
          </div>
        </div>

        <v-divider></v-divider>

        <!-- Table -->
        <div v-if="filteredLowStock.length > 0" class="table-wrap">
          <v-table class="stock-table" hover>
            <thead>
              <tr>
                <th class="th-cell">Product</th>
                <th class="th-cell">Unit</th>
                <th class="th-cell">Purchase Date</th>
                <th class="th-cell">Stock Level</th>
                <th class="th-cell">Quantity</th>
                <th class="th-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredLowStock"
                :key="product.id"
                class="td-row"
                :style="{ borderLeft: `4px solid ${getStockBorder(product.quantity)}` }"
              >
                <!-- Product -->
                <td class="td-cell">
                  <div class="d-flex align-center ga-3">
                    <div
                      class="product-avatar"
                      :style="{
                        background:
                          product.quantity <= 3
                            ? 'linear-gradient(135deg,#8b0000,#e53935)'
                            : 'linear-gradient(135deg,#e65100,#fb8c00)',
                      }"
                    >
                      {{ product.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="product-name-text">{{ product.name }}</span>
                  </div>
                </td>

                <!-- Unit -->
                <td class="td-cell">
                  <span class="unit-text">{{ product.unit }}</span>
                </td>

                <!-- Purchase Date -->
                <td class="td-cell">
                  <v-chip size="small" color="blue-grey" variant="tonal" class="date-chip">
                    <v-icon start size="11">mdi-calendar</v-icon>
                    {{ product.purchaseDate }}
                  </v-chip>
                </td>

                <!-- Stock Bar -->
                <td class="td-cell" style="min-width: 140px">
                  <div class="stock-bar-wrap">
                    <div class="stock-bar-track">
                      <div
                        class="stock-bar-fill"
                        :style="{
                          width: stockBarWidth(product.quantity),
                          background:
                            product.quantity <= 3
                              ? 'linear-gradient(90deg,#8b0000,#e53935)'
                              : 'linear-gradient(90deg,#e65100,#ffa726)',
                        }"
                      ></div>
                    </div>
                    <span class="stock-bar-pct"
                      >{{ Math.round((product.quantity / 10) * 100) }}%</span
                    >
                  </div>
                </td>

                <!-- Quantity -->
                <td class="td-cell">
                  <span
                    class="qty-badge"
                    :style="{
                      background: getStockBg(product.quantity),
                      border: `1px solid ${getStockBorder(product.quantity)}`,
                      color: product.quantity <= 3 ? '#8b0000' : '#e65100',
                    }"
                  >
                    {{ product.quantity }}
                  </span>
                </td>

                <!-- Status -->
                <td class="td-cell">
                  <v-chip
                    size="small"
                    :color="getStockColor(product.quantity)"
                    variant="flat"
                    class="status-chip"
                  >
                    <v-icon start size="12">
                      {{ product.quantity <= 3 ? 'mdi-alert-octagon' : 'mdi-alert' }}
                    </v-icon>
                    {{ getStockLabel(product.quantity) }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state py-16 text-center">
          <div class="empty-icon-wrap mb-5">
            <v-icon size="52" color="success">mdi-check-circle-outline</v-icon>
          </div>
          <p class="empty-title mb-1">
            {{ searchQuery ? 'No results found' : 'All stocks are sufficient!' }}
          </p>
          <p class="empty-sub">
            {{
              searchQuery
                ? 'Try a different search term.'
                : 'No products are currently below the low stock threshold.'
            }}
          </p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.stock-bg {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Header ── */
.stock-header {
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
.stock-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.back-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}
.back-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12) !important;
}
.header-icon-wrap {
  width: 46px;
  height: 46px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.header-eyebrow {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0;
}
.header-title {
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
}
.refresh-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}
.refresh-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12) !important;
}

/* ── Summary Cards ── */
.summary-card {
  border-radius: 14px;
  padding: 20px 22px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  height: 100%;
  border: 2px solid transparent;
}
.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
}
.summary-card--active {
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
}
.summary-card--red {
  background: linear-gradient(135deg, #7b0000, #c62828);
}
.summary-card--amber {
  background: linear-gradient(135deg, #e65100, #f57c00);
}
.summary-card--dark {
  background: linear-gradient(135deg, #37474f, #546e7a);
}
.summary-icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  opacity: 0.8;
  margin: 0 0 2px;
}
.summary-value {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 2px;
  line-height: 1;
}
.summary-sub {
  font-size: 0.7rem;
  opacity: 0.7;
  margin: 0;
}

/* ── Table Card ── */
.table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}
.table-card-header {
  background: #fff;
}
.table-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* Search field */
.search-field :deep(.v-field) {
  border-radius: 10px;
}

/* ── Table ── */
.table-wrap {
  overflow-x: auto;
}
.stock-table {
  width: 100%;
}

.th-cell {
  background: #fafafa !important;
  color: #555 !important;
  font-size: 0.71rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  padding: 14px 20px !important;
  border-bottom: 2px solid #f0f0f0 !important;
  white-space: nowrap;
}

.td-row {
  transition: background 0.15s ease;
}
.td-row:hover {
  background: #fdf5f5 !important;
}
.td-row:not(:last-child) td {
  border-bottom: 1px solid #f8f8f8;
}

.td-cell {
  padding: 14px 20px !important;
  vertical-align: middle;
}

.product-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.product-name-text {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}
.unit-text {
  color: #666;
  font-size: 0.82rem;
  font-weight: 500;
}
.date-chip {
  font-size: 0.71rem !important;
}

/* Stock bar */
.stock-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stock-bar-track {
  flex: 1;
  height: 7px;
  background: #f0f0f0;
  border-radius: 99px;
  overflow: hidden;
}
.stock-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}
.stock-bar-pct {
  font-size: 0.72rem;
  color: #888;
  font-weight: 600;
  min-width: 32px;
}

/* Qty badge */
.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  padding: 3px 10px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 800;
}

.status-chip {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
}

/* ── Empty State ── */
.empty-icon-wrap {
  width: 90px;
  height: 90px;
  background: #f1faf2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid #a5d6a7;
}
.empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #333;
}
.empty-sub {
  font-size: 0.85rem;
  color: #888;
}
</style>
