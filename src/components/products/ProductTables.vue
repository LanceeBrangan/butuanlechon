<script setup>
defineProps({
  products: { type: Array, default: () => [] },
  currentDate: { type: String, default: '' },
})

defineEmits(['edit', 'delete', 'add'])


const today = new Date()
today.setHours(0, 0, 0, 0)

const expiryColor = (dateStr) => {
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)  return 'error'    // expired — red
  if (diffDays <= 2) return 'warning'  // expiring soon — orange
  return 'success'                     // fresh — green
}

const expiryLabel = (dateStr) => {
  const expiry = new Date(dateStr)
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)  return `Expired ${Math.abs(diffDays)} day(s) ago`
  if (diffDays === 0) return 'Expires TODAY'
  return `Expires in ${diffDays} day(s)`
}
</script>

<template>
  <div class="table-card">
    <!-- Card Header -->
    <div class="table-card-header px-6 py-5">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div class="d-flex align-center ga-3">
          <h2 class="table-card-title">Product List</h2>
          <v-chip size="small" class="count-chip">{{ products.length }} items</v-chip>
        </div>
        <v-alert type="info" variant="tonal" density="compact" class="tip-alert" border="start">
          <span class="text-caption">
            Products with same name but different purchase dates are tracked separately.
          </span>
        </v-alert>
      </div>
    </div>

    <v-divider></v-divider>

    <!-- Table -->
    <div class="table-wrap" v-if="products.length > 0">
      <v-table class="product-table" hover>
        <thead>
          <tr>
            <th class="th-cell">Product Name</th>
            <th class="th-cell">Purchase Date</th>
            <th class="th-cell">Quantity/Unit</th>
            <th class="th-cell">Expiry Date</th>
            <th class="th-cell">Price </th>
            <th class="th-cell">Total Value</th>
            <th class="th-cell text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="td-row">
            <td class="td-cell">
              <div class="d-flex align-center ga-3">
                <div class="product-avatar">
                  {{ product.name.charAt(0).toUpperCase() }}
                </div>
                <span class="product-name-text">{{ product.name }}</span>
              </div>
            </td>
            <td class="td-cell">
              <v-chip
                size="small"
                :color="product.purchaseDate === currentDate ? 'success' : 'blue-grey'"
                variant="tonal"
                class="date-chip"
              >
                <v-icon start size="12">mdi-calendar</v-icon>
                {{ product.purchaseDate }}
                <v-tooltip activator="parent" location="top">
                  {{ product.purchaseDate === currentDate ? 'Purchased TODAY' : 'Purchased on ' + product.purchaseDate }}
                </v-tooltip>
              </v-chip>
            </td>
            <td class="td-cell">
              <div class="d-flex align-center ga-2">
                <span class="qty-badge" :class="product.quantity <= 10 ? 'qty-low' : 'qty-ok'">
                  {{ product.quantity }}
                </span>
                <span class="unit-text">{{ product.unit }}</span>
              </div>
            </td>
            <td class="td-cell">
                  <template v-if="product.expiryDate">
                    <v-chip
                      size="small"
                      :color="expiryColor(product.expiryDate)"
                      variant="tonal"
                      class="date-chip"
                    >
                      <v-icon start size="12">mdi-calendar-alert</v-icon>
                      {{ product.expiryDate }}
                      <v-tooltip activator="parent" location="top">
                        {{ expiryLabel(product.expiryDate) }}
                      </v-tooltip>
                    </v-chip>
                  </template>
                  <span v-else class="text-grey text-caption">—</span>
              </td>
            <td class="td-cell">
              <span class="price-text">₱{{ product.price.toLocaleString() }}</span>
            </td>
            <td class="td-cell">
              <span class="total-text">₱{{ product.totalPrice.toLocaleString() }}</span>
            </td>
            <td class="td-cell text-center">
              <div class="d-flex justify-center ga-2">
                <v-btn icon size="small" variant="tonal" color="primary" class="tbl-btn" @click="$emit('edit', product)">
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="tonal" color="error" class="tbl-btn" @click="$emit('delete', product)">
                  <v-icon size="16">mdi-trash-can-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state py-16">
      <div class="empty-icon-wrap mb-6">
        <v-icon size="56" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
      </div>
      <p class="empty-title mb-2">No products yet</p>
      <p class="empty-sub mb-6">Start by adding your first product to the inventory.</p>
      <v-btn class="action-btn" rounded="lg" @click="$emit('add')">
        <v-icon start size="18">mdi-plus</v-icon>
        Add First Product
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.table-card-header { background: #fff; }
.table-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}
.count-chip {
  background: #f0f0f0 !important;
  color: #555 !important;
  font-weight: 600;
  font-size: 0.72rem;
}
.tip-alert {
  font-size: 0.78rem;
  max-width: 460px;
  padding: 6px 12px !important;
}
.table-wrap { overflow-x: auto; }
.product-table { width: 100%; }
.th-cell {
  background: #fafafa !important;
  color: #555 !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px !important;
  text-transform: uppercase !important;
  padding: 14px 20px !important;
  border-bottom: 2px solid #f0f0f0 !important;
  white-space: nowrap;
}
.td-row { transition: background 0.15s ease; }
.td-row:hover { background: #fdf5f5 !important; }
.td-row:not(:last-child) td { border-bottom: 1px solid #f5f5f5; }
.td-cell { padding: 14px 20px !important; vertical-align: middle; }
.product-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8b0000, #c62828);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.product-name-text { font-weight: 600; color: #1a1a1a; font-size: 0.9rem; }
.date-chip { font-size: 0.72rem !important; }
.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
}
.qty-ok  { background: #e8f5e9; color: #2e7d32; }
.qty-low { background: #fff3e0; color: #e65100; }
.unit-text  { color: #888; font-size: 0.78rem; }
.price-text { color: #2e7d32; font-weight: 600; font-size: 0.88rem; }
.total-text { color: #8b0000; font-weight: 700; font-size: 0.92rem; }
.tbl-btn { border-radius: 8px !important; }
.empty-state { text-align: center; }
.empty-icon-wrap {
  width: 96px;
  height: 96px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.empty-title { font-size: 1.1rem; font-weight: 700; color: #333; }
.empty-sub   { font-size: 0.875rem; color: #888; }
.action-btn {
  background: rgba(139, 0, 0, 0.95) !important;
  color: #fff !important;
  font-weight: 700 !important;
  text-transform: none !important;
}
</style>
