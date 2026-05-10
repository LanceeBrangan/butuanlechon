<script setup>
import { reactive, ref } from 'vue'
import { useProducts } from '@/composables/products/index.js'

const { products, lowStockProducts, deductMultipleProducts } = useProducts()

// reactive object to store daily usage inputs
const usage = reactive({})

// Alert dialog state
const showAlert = ref(false)
const alertMessage = ref('')

// submit function
const submitUsage = () => {
  const usageArray = []

  for (const id in usage) {
    if (usage[id] > 0) {
      usageArray.push({
        productId: Number(id),
        quantity: usage[id],
      })
    }
  }

  if (!usageArray.length) {
    alertMessage.value = 'Please input usage before submitting'
    showAlert.value = true
    return
  }

  deductMultipleProducts(usageArray)

  // reset input fields
  for (const key in usage) usage[key] = 0
}
</script>

<template>
  <div class="daily-bg">
    <v-container fluid class="pa-5">
      <!-- Page Header -->
      <v-card class="mb-6 header-card" elevation="5">
        <v-card-title class="header-title">
          <v-icon class="mr-3">mdi-clipboard-check-outline</v-icon>
          Daily Product Usage
        </v-card-title>
        <v-card-subtitle class="header-subtitle">
          Input today’s ingredient consumption
        </v-card-subtitle>
      </v-card>

      <!-- Usage Table -->
      <v-card elevation="8" class="table-card">
        <v-table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Used Today</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td class="fw-600">{{ p.name }}</td>
              <td>{{ p.quantity }}</td>
              <td style="max-width: 140px">
                <v-text-field
                  v-model.number="usage[p.id]"
                  type="number"
                  min="0"
                  density="compact"
                  variant="outlined"
                  placeholder="0"
                  hide-details
                />
              </td>
              <td>
                <v-chip
                  v-if="lowStockProducts.includes(p)"
                  color="red-darken-2"
                  variant="tonal"
                  size="small"
                >
                  Low Stock
                </v-chip>

                <v-chip v-else color="green-darken-2" variant="tonal" size="small"> OK </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-divider />

        <!-- Action Button -->
        <v-card-actions class="justify-end pa-6">
          <v-btn
            color="red-darken-2"
            size="medium"
            prepend-icon="mdi-minus-circle-outline"
            @click="submitUsage"
          >
            Deduct Quantity
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <!-- Alert Dialog -->
    <v-dialog v-model="showAlert" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 bg-red-darken-2 text-white">
          <v-icon start color="white">mdi-alert-circle</v-icon>
          Validation Error
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <p class="mb-0">{{ alertMessage }}</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="red-darken-2" variant="elevated" @click="showAlert = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.daily-bg {
  background: #f7f7f7;
  min-height: 100vh;
  display: block;
}

/* Header Card */
.header-card {
  background: linear-gradient(90deg, #8b0000 0%, #a52a2a 100%);
  border-radius: 18px;
  color: white;
}

.header-title {
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.85);
  margin-left: 48px;
}

/* Table Card */
.table-card {
  border-radius: 20px;
  background: #fff;
}

th {
  font-weight: 700;
  color: #8b0000;
}

.fw-600 {
  font-weight: 600;
}
</style>
