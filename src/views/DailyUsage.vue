<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/products/index.js'

const router = useRouter()

const { products, lowStockProducts, fetchProducts, deductMultipleProducts } = useProducts()

const usage = reactive({})
const isRefreshing = ref(false)
const isSubmitting = ref(false)

const showAlert = ref(false)
const alertMessage = ref('')
const alertType = ref('error')

onMounted(async () => {
  await fetchProducts()
})

const refreshProducts = async () => {
  isRefreshing.value = true
  try {
    await fetchProducts()
    for (const key in usage) usage[key] = 0
  } finally {
    setTimeout(() => (isRefreshing.value = false), 500)
  }
}

const getStockStatus = (product) => {
  if (lowStockProducts.value.includes(product)) return 'low'
  return 'ok'
}

const getUsageExceedsStock = (product) => {
  const used = Number(usage[product.id]) || 0
  return used > product.quantity
}

const totalItemsToDeduct = () => {
  return Object.values(usage).filter((v) => Number(v) > 0).length
}

const submitUsage = async () => {
  const usageArray = []

  for (const id in usage) {
    const qty = Number(usage[id])
    if (qty > 0) {
      const product = products.value.find((p) => String(p.id) === String(id)) // ✅ UUID string compare
      if (product && qty > product.quantity) {
        alertMessage.value = `"${product.name}" only has ${product.quantity} ${product.unit} in stock. You entered ${qty}.`
        alertType.value = 'error'
        showAlert.value = true
        return
      }
      usageArray.push({ productId: id, quantity: qty }) // ✅ keep as string UUID
    }
  }

  if (!usageArray.length) {
    alertMessage.value = 'Please enter usage quantity for at least one product before submitting.'
    alertType.value = 'error'
    showAlert.value = true
    return
  }

  isSubmitting.value = true
  try {
    await deductMultipleProducts(usageArray)
    for (const key in usage) usage[key] = 0
    alertMessage.value = `Successfully deducted ${usageArray.length} product(s) from inventory.`
    alertType.value = 'success'
    showAlert.value = true
  } catch (err) {
    alertMessage.value = 'Something went wrong while deducting. Please try again.'
    alertType.value = 'error'
    showAlert.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="daily-bg">
    <v-container fluid class="pa-6 pa-md-8">
      <!-- ── Header ── -->
      <div class="daily-header mb-8">
        <div class="d-flex align-center ga-3">
          <v-btn icon variant="text" class="back-btn" @click="router.back()">
            <v-icon size="20">mdi-arrow-left</v-icon>
          </v-btn>
          <div class="header-icon-wrap">
            <v-icon size="26" color="white">mdi-clipboard-check-outline</v-icon>
          </div>
          <div>
            <p class="header-eyebrow">Inventory Management</p>
            <h1 class="header-title">Daily Product Usage</h1>
          </div>
        </div>
        <div class="d-flex align-center ga-3">
          <v-btn
            icon
            variant="text"
            class="refresh-btn"
            :loading="isRefreshing"
            @click="refreshProducts"
          >
            <v-icon size="20">mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="bottom">Refresh Products</v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- ── Info Banner ── -->
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        border="start"
        class="mb-6 info-banner"
      >
        <span class="text-body-2">
          <strong>Instructions:</strong> Enter the quantity used today for each product, then click
          <strong>Deduct Quantity</strong>. Quantities exceeding available stock will be flagged.
        </span>
      </v-alert>

      <!-- ── Table Card ── -->
      <div class="table-card">
        <!-- Card Header -->
        <div class="table-card-header px-6 py-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <h2 class="table-card-title">Product List</h2>
              <v-chip size="small" variant="tonal" color="error">
                {{ products.length }} products
              </v-chip>
            </div>
            <v-chip v-if="totalItemsToDeduct() > 0" size="small" color="success" variant="flat">
              <v-icon start size="13">mdi-check</v-icon>
              {{ totalItemsToDeduct() }} item(s) queued
            </v-chip>
          </div>
        </div>

        <v-divider></v-divider>

        <!-- Table -->
        <div class="table-wrap" v-if="products.length > 0">
          <v-table class="usage-table" hover>
            <thead>
              <tr>
                <th class="th-cell">Product</th>
                <th class="th-cell">Unit</th>
                <th class="th-cell">Current Stock</th>
                <th class="th-cell">Used Today</th>
                <th class="th-cell">Remaining</th>
                <th class="th-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
                class="td-row"
                :class="{
                  'td-row--warning': getUsageExceedsStock(product),
                  'td-row--lowstock':
                    getStockStatus(product) === 'low' && !getUsageExceedsStock(product),
                }"
              >
                <!-- Product Name -->
                <td class="td-cell">
                  <div class="d-flex align-center ga-3">
                    <div
                      class="product-avatar"
                      :class="{
                        'avatar--red': getStockStatus(product) === 'low',
                        'avatar--green': getStockStatus(product) === 'ok',
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

                <!-- Current Stock -->
                <td class="td-cell">
                  <span
                    class="stock-badge"
                    :class="{
                      'stock-badge--low': product.quantity <= 10,
                      'stock-badge--ok': product.quantity > 10,
                    }"
                  >
                    {{ product.quantity }}
                  </span>
                </td>

                <!-- Usage Input -->
                <td class="td-cell" style="min-width: 140px">
                  <v-text-field
                    v-model.number="usage[product.id]"
                    type="number"
                    min="0"
                    density="compact"
                    variant="outlined"
                    placeholder="0"
                    hide-details
                    class="usage-input"
                    :class="{ 'usage-input--error': getUsageExceedsStock(product) }"
                  />
                </td>

                <!-- Remaining Preview -->
                <td class="td-cell">
                  <span
                    class="remaining-text"
                    :class="{
                      'remaining--negative': getUsageExceedsStock(product),
                      'remaining--ok': !getUsageExceedsStock(product),
                    }"
                  >
                    {{
                      getUsageExceedsStock(product)
                        ? '⚠ Exceeds stock'
                        : product.quantity - (Number(usage[product.id]) || 0)
                    }}
                  </span>
                </td>

                <!-- Status -->
                <td class="td-cell">
                  <v-chip
                    v-if="getUsageExceedsStock(product)"
                    size="small"
                    color="error"
                    variant="flat"
                    class="status-chip"
                  >
                    <v-icon start size="12">mdi-alert-octagon</v-icon>
                    Over Limit
                  </v-chip>
                  <v-chip
                    v-else-if="getStockStatus(product) === 'low'"
                    size="small"
                    color="warning"
                    variant="flat"
                    class="status-chip"
                  >
                    <v-icon start size="12">mdi-alert</v-icon>
                    Low Stock
                  </v-chip>
                  <v-chip v-else size="small" color="success" variant="tonal" class="status-chip">
                    <v-icon start size="12">mdi-check-circle</v-icon>
                    OK
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state py-16 text-center">
          <div class="empty-icon-wrap mb-5">
            <v-icon size="52" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
          </div>
          <p class="empty-title mb-1">No products found</p>
          <p class="empty-sub">Add products to the inventory first.</p>
        </div>

        <v-divider></v-divider>

        <!-- Actions -->
        <div class="table-footer px-6 py-5">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <p class="footer-hint">
              <v-icon size="14" color="grey" class="mr-1">mdi-information-outline</v-icon>
              Only products with quantity &gt; 0 will be deducted.
            </p>
            <v-btn
              class="deduct-btn"
              size="large"
              rounded="lg"
              elevation="0"
              :loading="isSubmitting"
              :disabled="isSubmitting || products.length === 0"
              @click="submitUsage"
            >
              <v-icon start>mdi-minus-circle-outline</v-icon>
              Deduct Quantity
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>

    <!-- ── Alert / Success Dialog ── -->
    <v-dialog v-model="showAlert" max-width="420px">
      <v-card rounded="xl" elevation="12" class="dlg-card">
        <div
          class="dlg-header px-6 py-5"
          :class="alertType === 'success' ? 'dlg-header--success' : 'dlg-header--error'"
        >
          <div class="d-flex align-center ga-3">
            <v-icon size="22" color="white">
              {{
                alertType === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'
              }}
            </v-icon>
            <span class="dlg-title">
              {{ alertType === 'success' ? 'Success' : 'Validation Error' }}
            </span>
          </div>
        </div>
        <v-card-text class="px-6 py-6">
          <p class="text-body-1 text-center">{{ alertMessage }}</p>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 justify-center">
          <v-btn
            :color="alertType === 'success' ? 'success' : 'error'"
            variant="flat"
            rounded="lg"
            style="min-width: 120px"
            class="font-weight-bold"
            @click="showAlert = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.daily-bg {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Header ── */
.daily-header {
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
}
.refresh-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}
.refresh-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12) !important;
}

/* ── Info Banner ── */
.info-banner {
  border-radius: 10px;
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

/* ── Table ── */
.table-wrap {
  overflow-x: auto;
}
.usage-table {
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
.td-row--warning {
  background: #fff5f5 !important;
}
.td-row--lowstock {
  background: #fffde7 !important;
}

.td-cell {
  padding: 14px 20px !important;
  vertical-align: middle;
}

/* Avatar */
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
.avatar--red {
  background: linear-gradient(135deg, #8b0000, #e53935);
}
.avatar--green {
  background: linear-gradient(135deg, #1b5e20, #388e3c);
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

/* Stock badge */
.stock-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  padding: 3px 10px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 800;
}
.stock-badge--low {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}
.stock-badge--ok {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

/* Usage input */
.usage-input :deep(.v-field) {
  border-radius: 9px;
  transition: all 0.2s;
}
.usage-input--error :deep(.v-field) {
  border-color: #e53935 !important;
  background: #fff5f5;
}

/* Remaining */
.remaining-text {
  font-size: 0.88rem;
  font-weight: 600;
}
.remaining--ok {
  color: #2e7d32;
}
.remaining--negative {
  color: #c62828;
  font-size: 0.8rem;
}

.status-chip {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
}

/* Footer */
.table-footer {
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}
.footer-hint {
  font-size: 0.78rem;
  color: #888;
  margin: 0;
}

.deduct-btn {
  background: linear-gradient(135deg, #7b0000, #c62828) !important;
  color: #fff !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 0.2px;
}
.deduct-btn:hover {
  background: linear-gradient(135deg, #9b0000, #e53935) !important;
  box-shadow: 0 4px 16px rgba(139, 0, 0, 0.35) !important;
}

/* ── Empty State ── */
.empty-icon-wrap {
  width: 90px;
  height: 90px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
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

/* ── Dialogs ── */
.dlg-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  overflow: hidden;
}
.dlg-header--error {
  background: linear-gradient(120deg, #7b0000, #c62828);
}
.dlg-header--success {
  background: linear-gradient(120deg, #1b5e20, #388e3c);
}
.dlg-title {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
}
</style>
