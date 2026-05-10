<script setup>
import { ref, onMounted } from 'vue'
import { useProducts } from '@/composables/products/index.js'

import ProductHeader from '@/components/products/ProductHeader.vue'
import ProductFormDialog from '@/components/products/ProductFormDialog.vue'
import ProductDeleteDialog from '@/components/products/ProductDeleteDialog.vue'
import ProductDeductDialog from '@/components/products/ProductDeductDialog.vue'
import ProductEditWarningDialog from '@/components/products/ProductEditWarningDialog.vue'
import ProductUpdateDialog from '@/components/products/ProductUpdateStockDialog.vue'
import ProductTable from '@/components/products/ProductTables.vue'

const {
  products,
  lowStockProducts,
  currentSimulatedDate,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deductProduct,
} = useProducts()

onMounted(() => fetchProducts())

// Dialog visibility
const dialog = ref(false)
const deleteDialog = ref(false)
const deductDialog = ref(false)
const editWarningDialog = ref(false)
const updateStockDialog = ref(false)

// Shared state between dialogs
const isEditMode = ref(false)
const productToDelete = ref(null)
const productToEdit = ref(null)
const productForm = ref({ name: '', quantity: 0, unit: '', price: 0, purchaseDate: currentSimulatedDate.value })

const openAddDialog = () => {
  isEditMode.value = false
  productForm.value = { name: '', quantity: 0, unit: '', price: 0, purchaseDate: currentSimulatedDate.value }
  dialog.value = true
}

const editProduct = (product) => {
  productToEdit.value = product
  if (product.purchaseDate !== currentSimulatedDate.value) {
    editWarningDialog.value = true
  } else {
    isEditMode.value = true
    productForm.value = { ...product }
    dialog.value = true
  }
}

const onProceedToEdit = (product) => {
  isEditMode.value = true
  productForm.value = { ...product }
  editWarningDialog.value = false
  dialog.value = true
}

const onUpdateStock = () => {
  editWarningDialog.value = false
  updateStockDialog.value = true
}

const onDeleteRequest = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}
</script>

<template>
  <div class="app-background">
    <v-container class="pa-4 pa-md-8" fluid>
      <ProductHeader
        :low-stock-count="lowStockProducts.length"
        :total-count="products.length"
        :current-date="currentSimulatedDate"
        @add="openAddDialog"
        @refresh="fetchProducts"
      />

      <ProductTable
        :products="products"
        :current-date="currentSimulatedDate"
        @edit="editProduct"
        @delete="onDeleteRequest"
        @add="openAddDialog"
      />
    </v-container>

    <ProductFormDialog
      v-model="dialog"
      :is-edit-mode="isEditMode"
      :initial-form="productForm"
      :current-date="currentSimulatedDate"
      :existing-products="products"
      @save="(data, date) => isEditMode.value ? updateProduct(data) : addProduct(data, date)"
    />

    <ProductDeleteDialog
      v-model="deleteDialog"
      :product="productToDelete"
      @confirm="deleteProduct(productToDelete.id)"
    />

    <ProductDeductDialog
      v-model="deductDialog"
      :products="products"
      @confirm="(id, qty) => deductProduct(id, qty)"
    />

    <ProductEditWarningDialog
      v-model="editWarningDialog"
      :product="productToEdit"
      @proceed-edit="onProceedToEdit"
      @update-stock="onUpdateStock"
    />

    <ProductUpdateDialog
      v-model="updateStockDialog"
      :product="productToEdit"
      :current-date="currentSimulatedDate"
      @confirm="updateProduct"
    />
  </div>
</template>

<style scoped>
.app-background {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
</style>
