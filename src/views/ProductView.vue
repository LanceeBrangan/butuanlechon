<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts.js'

const router = useRouter()
const isRefreshing = ref(false)

const {
  products,
  addProduct,
  updateProduct,
  deleteProduct,
  deductProduct,
  lowStockProducts,
  currentSimulatedDate,
  fetchProducts,
} = useProducts()

// Fetch products on component mount
onMounted(async () => {
  await fetchProducts()
})

// Reactive data
const drawer = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditMode = ref(false)
const valid = ref(false)
const productToDelete = ref(null)

// NEW: Warning dialog for editing products
const editWarningDialog = ref(false)
const productToEdit = ref(null)

// NEW: Update with additional stock tracking
const updateStockDialog = ref(false)
const additionalQuantity = ref(0)
const additionalPricePerUnit = ref(0)

//add
const productForm = ref({
  name: '',
  quantity: 0,
  unit: '',
  price: 0,
  purchaseDate: currentSimulatedDate.value,
})

//Deduct
const deductDialog = ref(false)
const selectedProductId = ref(null)
const deductQuantity = ref(0)

// Form validation rules
const nameRules = [
  (v) => !!v || 'Product name is required',
  (v) => (v && v.length >= 2) || 'Product name must be at least 2 characters',
]

const quantityRules = [
  (v) => !!v || 'Quantity is required',
  (v) => v > 0 || 'Quantity must be greater than 0',
]

const unitRules = [(v) => !!v || 'Unit is required']

const priceRules = [
  (v) => !!v || 'Price is required',
  (v) => v > 0 || 'Price must be greater than 0',
]

// Computed properties
const totalPrice = computed(() => {
  return productForm.value.quantity * productForm.value.price || 0
})

const additionalTotalPrice = computed(() => {
  return additionalQuantity.value * additionalPricePerUnit.value || 0
})

// Group products by name for better display
const groupedProducts = computed(() => {
  const groups = {}
  products.value.forEach((product) => {
    if (!groups[product.name]) {
      groups[product.name] = []
    }
    groups[product.name].push(product)
  })
  return groups
})

// Methods
const handleLogout = () => {
  router.push('/')
}

//add
const openAddDialog = () => {
  isEditMode.value = false
  productForm.value = {
    name: '',
    quantity: 0,
    unit: '',
    price: 0,
    purchaseDate: currentSimulatedDate.value,
  }
  dialog.value = true
}

const editProduct = (product) => {
  // Check if this product was purchased on a previous date
  if (product.purchaseDate !== currentSimulatedDate.value) {
    productToEdit.value = product
    editWarningDialog.value = true
  } else {
    proceedToEdit(product)
  }
}

const proceedToEdit = (product) => {
  isEditMode.value = true
  productForm.value = { ...product }
  dialog.value = true
  editWarningDialog.value = false
}

const updateExistingStock = () => {
  const product = productToEdit.value
  editWarningDialog.value = false

  // Open update stock dialog
  productToEdit.value = product
  additionalQuantity.value = 0
  additionalPricePerUnit.value = product.price // Default to existing price
  updateStockDialog.value = true
}

const confirmStockUpdate = async () => {
  const product = productToEdit.value
  const addedQty = Number(additionalQuantity.value)
  const pricePerUnit = Number(additionalPricePerUnit.value)

  if (addedQty <= 0 || pricePerUnit <= 0) return

  // Calculate new total quantity and weighted average price
  const oldTotalValue = product.quantity * product.price
  const addedValue = addedQty * pricePerUnit
  const newQuantity = product.quantity + addedQty
  const newAveragePrice = (oldTotalValue + addedValue) / newQuantity

  // Update product with new values
  const updatedProduct = {
    ...product,
    quantity: newQuantity,
    price: newAveragePrice,
    totalPrice: newQuantity * newAveragePrice,
    _additionalExpense: addedValue, // Track additional expense for today
    _addedOnDate: currentSimulatedDate.value, // Track when added
  }

  await updateProduct(updatedProduct)

  updateStockDialog.value = false
  productToEdit.value = null
  additionalQuantity.value = 0
  additionalPricePerUnit.value = 0
}

const closeDialog = () => {
  dialog.value = false
  isEditMode.value = false
  productForm.value = {
    name: '',
    quantity: 0,
    unit: '',
    price: 0,
    purchaseDate: currentSimulatedDate.value,
  }
}

const saveProduct = () => {
  if (!valid.value) return

  const productData = {
    ...productForm.value,
    totalPrice: totalPrice.value,
  }

  if (isEditMode.value) {
    updateProduct(productData)
  } else {
    // Pass custom date if different from current business date
    addProduct(productData, productForm.value.purchaseDate)
  }

  closeDialog()
}

const deleteProductHandler = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const confirmDelete = () => {
  deleteProduct(productToDelete.value.id)
  deleteDialog.value = false
  productToDelete.value = null
}

//Deduct
const openDeductDialog = async () => {
  selectedProductId.value = null
  deductQuantity.value = 0
  try {
    await fetchProducts()
    console.log('Products loaded:', products.value)
  } catch (error) {
    console.error('Error fetching products:', error)
  }
  deductDialog.value = true
}

const closeDeductDialog = () => (deductDialog.value = false)

const submitDeduct = () => {
  if (!selectedProductId.value || deductQuantity.value <= 0) return
  deductProduct(selectedProductId.value, Number(deductQuantity.value))
  closeDeductDialog()
}
const refreshInventory = async () => {
  isRefreshing.value = true
  try {
    await fetchProducts()
  } finally {
    // Add a slight delay for better UX so the user sees the spin
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}



</script>

<template>
  <div class="app-background">
    <!-- Main Content -->
    <v-container class="pa-4 pa-md-8">
      <!-- Header -->
      <v-row class="mb-8 header-container pa-4 pa-md-8 rounded-xl">
        <v-col
          cols="11"
          class="d-flex flex-column flex-md-row justify-md-space-between align-center ga-4 ga-md-0"
        >
          <h1 class="page-title">Product Inventory</h1>

          <div class="d-flex flex-column flex-sm-row ga-3 ga-sm-4 w-100 w-md-auto">
            <!-- Add Product Button -->
            <v-btn
              class="add-product-btn px-6 px-sm-10 py-2 text-body-2 text-sm-body-1 font-weight-bold flex-grow-1 flex-sm-grow-0"
              rounded="l"
              elevation="6"
              @click="openAddDialog"
            >
              <v-icon start size="small" class="hidden-sm-and-up">mdi-plus-circle</v-icon>
              <v-icon start class="hidden-xs">mdi-plus-circle</v-icon>
              <span class="hidden-xs">Add Product</span>
              <span class="hidden-sm-and-up">Add</span>
            </v-btn>



            <!--Deduct Product Button -->
            <v-btn
              class="deduct-product-btn px-6 px-sm-10 py-2 text-body-2 text-sm-body-1 font-weight-bold flex-grow-1 flex-sm-grow-0"
              rounded="l"
              elevation="6"
              @click="openDeductDialog"
            >
              <v-icon start size="small" class="hidden-sm-and-up">mdi-minus-circle</v-icon>
              <v-icon start class="hidden-xs">mdi-minus-circle</v-icon>
              <span class="hidden-xs">Deduct Product</span>
              <span class="hidden-sm-and-up">Deduct</span>
            </v-btn>



          </div>
        </v-col>

        <v-col cols="1">
             <!-- Refresh Button -->
              <v-btn
              icon
              variant="text"
              color="white"
              :loading="isRefreshing"
              @click="refreshInventory"
              class="my-5"
            >
              <v-icon>mdi-refresh</v-icon>
              <v-tooltip activator="parent" location="top">Refresh Inventory</v-tooltip>
            </v-btn>
        </v-col>
      </v-row>

      <!-- Product List Card -->
      <v-row>
        <v-col cols="12" class="product-list-container pa-4 pa-md-8 rounded-xl">
          <v-card class="product-list-card pa-6 pa-md-10 rounded-xl" elevation="4" min-height="550">
            <h2 class="section-title mb-6">Product Inventory List</h2>

            <!-- Info Alert -->
            <v-alert type="info" variant="tonal" class="mb-6" density="compact">
              <div class="text-body-2">
                <strong>💡 Tip:</strong> Products with the same name but different purchase dates
                are tracked separately for accurate expense reporting.
              </div>
            </v-alert>

            <v-divider class="section-divider mb-10"></v-divider>

            <!-- Product Table -->
            <v-table class="product-table" v-if="products.length > 0">
              <thead>
                <tr>
                  <th class="table-header">Product Name</th>
                  <th class="table-header">Purchase Date</th>
                  <th class="table-header">Quantity</th>
                  <th class="table-header">Price/Unit</th>
                  <th class="table-header">Total Price</th>
                  <th class="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id" class="product-row">
                  <td class="pa-5">
                    <span class="product-name">{{ product.name }}</span>
                  </td>
                  <td class="pa-5">
                    <v-chip
                      size="small"
                      :color="
                        product.purchaseDate === currentSimulatedDate ? 'success' : 'blue-grey'
                      "
                      variant="tonal"
                    >
                      {{ product.purchaseDate }}
                      <v-tooltip activator="parent" location="top">
                        {{
                          product.purchaseDate === currentSimulatedDate
                            ? 'Purchased TODAY'
                            : 'Purchased on ' + product.purchaseDate
                        }}
                      </v-tooltip>
                    </v-chip>
                  </td>
                  <td class="pa-5">
                    <span class="product-data">{{ product.quantity }}</span>
                  </td>
                  <td class="pa-5">
                    <span class="product-price">₱{{ product.price.toLocaleString() }}</span>
                  </td>
                  <td class="pa-5">
                    <span class="product-total">₱{{ product.totalPrice.toLocaleString() }}</span>
                  </td>
                  <td class="pa-5">
                    <div class="d-flex ga-3">
                      <v-btn
                        class="action-btn edit-btn"
                        icon
                        size="small"
                        elevation="2"
                        @click="editProduct(product)"
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                        <v-tooltip activator="parent" location="top"> Edit this entry </v-tooltip>
                      </v-btn>
                      <v-btn
                        class="action-btn delete-btn"
                        icon
                        size="small"
                        elevation="2"
                        @click="deleteProductHandler(product)"
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="top"> Delete this entry </v-tooltip>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- Empty State -->
            <div v-else class="text-center py-16">
              <div class="empty-state-icon mb-8">
                <v-icon size="120" class="text-grey-lighten-1">mdi-package-variant-closed</v-icon>
              </div>
              <p class="empty-state-text mb-10">
                No products in inventory yet. Start by adding your first product!
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Warning Dialog -->
    <v-dialog v-model="editWarningDialog" max-width="600px">
      <v-card class="dialog-card rounded-xl" elevation="8">
        <v-card-title class="warning-dialog-header pa-8 pb-6">
          <v-icon size="48" class="mr-4" color="white">mdi-alert</v-icon>
          <span class="dialog-title text-white">Old Stock - Edit Warning</span>
        </v-card-title>

        <v-card-text class="pa-8">
          <div class="text-h6 mb-4">
            This product was purchased on
            <strong class="text-warning">{{ productToEdit?.purchaseDate }}</strong>
          </div>

          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="text-body-1">
              <strong>⚠️ Important:</strong> If you're adding NEW STOCK today ({{
                currentSimulatedDate
              }}), you should click <strong>"Add New Stock"</strong> to properly track today's
              expenses.
            </div>
          </v-alert>

          <div class="text-body-1 mb-4">
            <strong>Choose what you want to do:</strong>
          </div>

          <v-list class="bg-transparent">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="success">mdi-package-variant-plus</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold">Update Existing Stock</v-list-item-title>
              <v-list-item-subtitle>
                I'm adding MORE stock to this product today ({{ currentSimulatedDate }}) <br />→
                Only the ADDITIONAL cost will be added to TODAY's expenses <br />→ Quantity and
                average price will be updated
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="info">mdi-pencil</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold">Edit Old Entry</v-list-item-title>
              <v-list-item-subtitle>
                I need to fix the {{ productToEdit?.purchaseDate }} entry (typo, wrong price, etc.)
                <br />→ This will update {{ productToEdit?.purchaseDate }}'s expenses
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-row class="ma-0">
            <v-col cols="12" class="d-flex justify-center ga-4">
              <v-btn
                variant="outlined"
                class="cancel-btn py-4 flex-grow-0"
                style="min-width: 160px"
                size="medium"
                rounded="xl"
                @click="editWarningDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn
                class="edit-old-btn py-4 flex-grow-0"
                style="min-width: 160px"
                size="medium"
                rounded="xl"
                elevation="4"
                color="info"
                @click="proceedToEdit(productToEdit)"
              >
                <v-icon start>mdi-pencil</v-icon>
                Edit Old Entry
              </v-btn>
              <v-btn
                class="update-stock-btn py-4 flex-grow-0"
                style="min-width: 160px"
                size="medium"
                rounded="xl"
                elevation="4"
                color="success"
                @click="updateExistingStock"
              >
                <v-icon start>mdi-package-variant-plus</v-icon>
                Update Stock
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update Stock Dialog (for adding more stock to existing product) -->
    <v-dialog v-model="updateStockDialog" max-width="650px" persistent>
      <v-card class="dialog-card rounded-xl" elevation="8">
        <v-card-title class="dialog-header pa-8 pb-6">
          <v-icon size="40" class="mr-4" color="white">mdi-package-variant-plus</v-icon>
          <span class="dialog-title">Update Stock - {{ productToEdit?.name }}</span>
        </v-card-title>

        <v-card-text class="pa-8">
          <!-- Current Stock Info -->
          <v-alert type="info" variant="tonal" class="mb-6">
            <div class="text-body-1">
              <strong>Current Stock ({{ productToEdit?.purchaseDate }}):</strong>
              <br />• Quantity: {{ productToEdit?.quantity }} {{ productToEdit?.unit }} <br />•
              Price/Unit: ₱{{ productToEdit?.price?.toLocaleString() }} <br />• Total Value: ₱{{
                productToEdit?.totalPrice?.toLocaleString()
              }}
            </div>
          </v-alert>

          <v-form>
            <v-row>
              <v-col cols="12">
                <h3 class="text-h6 mb-4 text-success">
                  Adding New Stock Today ({{ currentSimulatedDate }})
                </h3>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="additionalQuantity"
                  label="Additional Quantity"
                  type="number"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-plus"
                  hint="How many items are you adding?"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="additionalPricePerUnit"
                  label="Price per Unit (New Stock)"
                  type="number"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-currency-php"
                  hint="Price of the new stock"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 bg-green-lighten-5">
                  <div class="text-body-1">
                    <strong>Additional Cost (TODAY):</strong>
                    <span class="text-h5 text-success ml-2"
                      >₱{{ additionalTotalPrice.toLocaleString() }}</span
                    >
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-divider class="my-4"></v-divider>
                <h3 class="text-h6 mb-4">After Update Preview:</h3>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 bg-blue-grey-lighten-5">
                  <div class="text-body-2">
                    <div class="mb-2">
                      <strong>New Total Quantity:</strong>
                      {{ productToEdit?.quantity || 0 }} + {{ additionalQuantity || 0 }} =
                      <span class="text-primary font-weight-bold"
                        >{{
                          Number(productToEdit?.quantity || 0) + Number(additionalQuantity || 0)
                        }}
                        {{ productToEdit?.unit }}</span
                      >
                    </div>
                    <div class="mb-2">
                      <strong>New Average Price/Unit:</strong>
                      <span class="text-primary font-weight-bold">
                        ₱{{
                          (
                            ((productToEdit?.quantity || 0) * (productToEdit?.price || 0) +
                              additionalTotalPrice) /
                            (Number(productToEdit?.quantity || 0) +
                              Number(additionalQuantity || 0) || 1)
                          ).toFixed(2)
                        }}
                      </span>
                    </div>
                    <div>
                      <strong>New Total Value:</strong>
                      <span class="text-primary font-weight-bold">
                        ₱{{
                          (
                            (productToEdit?.quantity || 0) * (productToEdit?.price || 0) +
                            additionalTotalPrice
                          ).toLocaleString()
                        }}
                      </span>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            class="cancel-btn px-8 py-2"
            size="large"
            rounded="xl"
            @click="updateStockDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="save-btn px-8 py-2 ml-4"
            size="large"
            rounded="xl"
            elevation="4"
            color="success"
            @click="confirmStockUpdate"
            :disabled="
              !additionalQuantity ||
              additionalQuantity <= 0 ||
              !additionalPricePerUnit ||
              additionalPricePerUnit <= 0
            "
          >
            <v-icon start>mdi-check</v-icon>
            Confirm Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Product Dialog -->
    <v-dialog v-model="dialog" max-width="650px" persistent>
      <v-card class="dialog-card rounded-xl" elevation="8">
        <v-card-title class="dialog-header pa-8 pb-6">
          <span class="dialog-title">
            {{ isEditMode ? 'Edit Product' : 'Add New Product' }}
          </span>
        </v-card-title>

        <v-card-text class="pa-8">
          <v-form ref="productFormRef" v-model="valid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="productForm.name"
                  label="Product Name"
                  :rules="nameRules"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-food"
                ></v-text-field>
              </v-col>

              <!-- Purchase Date Picker -->
              <v-col cols="12" v-if="!isEditMode">
                <v-text-field
                  v-model="productForm.purchaseDate"
                  label="Purchase Date"
                  type="date"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-calendar"
                  hint="Select the date this product was purchased"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="productForm.quantity"
                  label="Quantity"
                  type="number"
                  :rules="quantityRules"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-counter"
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="productForm.price"
                  label="Price per Unit"
                  type="number"
                  :rules="priceRules"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-currency-php"
                ></v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="totalPrice"
                  label="Total Price"
                  readonly
                  variant="outlined"
                  class="form-field total-price-field"
                  prepend-inner-icon="mdi-calculator"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            class="cancel-btn px-8 py-2"
            size="large"
            rounded="xl"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            class="save-btn px-8 py-2 ml-4"
            size="large"
            rounded="xl"
            elevation="4"
            @click="saveProduct"
            :disabled="!valid"
          >
            {{ isEditMode ? 'Update' : 'Add' }} Product
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card class="dialog-card rounded-xl" elevation="8">
        <v-card-title class="delete-dialog-header pa-8 pb-6">
          <v-icon size="48" class="mr-4" color="white">mdi-alert-circle</v-icon>
          <span class="dialog-title text-white">Delete Product</span>
        </v-card-title>

        <v-card-text class="pa-8 text-center">
          <p class="text-h6 mb-4">Are you sure you want to delete</p>
          <p class="text-h5 font-weight-bold text-red-darken-2">"{{ productToDelete?.name }}"?</p>
          <p class="text-body-1 text-grey-darken-1 mt-4">This action cannot be undone.</p>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            class="cancel-btn px-8 py-5"
            size="large"
            rounded="xl"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="delete-confirm-btn px-8 py-5 ml-4"
            size="large"
            rounded="xl"
            elevation="4"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Deduct Product Dialog -->
    <v-dialog v-model="deductDialog" max-width="650px" persistent>
      <v-card class="dialog-card rounded-xl" elevation="8">
        <v-card-title class="dialog-header pa-8 pb-6">
          <span class="dialog-title">Deduct Product</span>
        </v-card-title>

        <v-card-text class="pa-8">
          <v-form>
            <v-row>
              <v-col cols="12">
                <label class="text-body2 font-weight-bold mb-2 d-block"
                  >Select Product to Deduct</label
                >
                <v-select
                  v-model="selectedProductId"
                  :items="products"
                  item-title="name"
                  item-value="id"
                  label="Choose a product from inventory"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-food"
                  persistent-hint
                  hide-details="auto"
                  required
                >
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :subtitle="`${item.raw.quantity} ${item.raw.unit} (Purchased: ${item.raw.purchaseDate})`"
                    >
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <span v-if="item.raw"
                      >{{ item.raw.name }} ({{ item.raw.quantity }} {{ item.raw.unit }} -
                      {{ item.raw.purchaseDate }})</span
                    >
                  </template>
                </v-select>
                <div class="text-caption text-grey mt-2">
                  {{ products.length }} product(s) available
                </div>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="deductQuantity"
                  type="number"
                  label="Quantity to Deduct"
                  variant="outlined"
                  class="form-field"
                  prepend-inner-icon="mdi-counter"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-8 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            class="cancel-btn px-8 py-2"
            size="large"
            rounded="xl"
            @click="closeDeductDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            class="save-btn px-8 py-2 ml-4"
            size="large"
            rounded="xl"
            elevation="4"
            color="red"
            @click="submitDeduct"
            :disabled="!selectedProductId || deductQuantity <= 0"
          >
            Deduct
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.app-background {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%);
  min-height: 100vh;
}

/* Header Styles */
.header-container {
  background: linear-gradient(135deg, #8b0000 0%, #b22222 100%);
  box-shadow: 0 8px 32px rgba(139, 0, 0, 0.2);
}

@media (max-width: 960px) {
  .header-container {
    padding: 1.5rem !important;
  }
}

@media (max-width: 600px) {
  .header-container {
    padding: 1rem !important;
  }
}

.page-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 960px) {
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}

.add-product-btn {
  background: linear-gradient(135deg, #fff 0%, #ffe4e1 100%) !important;
  color: #8b0000 !important;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3) !important;
  border: 2px solid rgba(139, 0, 0, 0.2);
}

.add-product-btn:hover {
  background: linear-gradient(135deg, #ffe4e1 0%, #fff 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.5) !important;
  border-color: rgba(139, 0, 0, 0.4);
}

.deduct-product-btn {
  background: linear-gradient(135deg, #ffe4e1 0%, #fff 100%) !important;
  color: #8b0000 !important;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3) !important;
  border: 2px solid rgba(139, 0, 0, 0.2);
}

.deduct-product-btn:hover {
  background: linear-gradient(135deg, #fff 0%, #ffe4e1 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.5) !important;
  border-color: rgba(139, 0, 0, 0.4);
}

@media (max-width: 960px) {
  .add-product-btn,
  .deduct-product-btn {
    padding: 12px 16px !important;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .add-product-btn,
  .deduct-product-btn {
    padding: 10px 12px !important;
    font-size: 0.85rem;
    width: 100%;
  }
}

.product-list-container {
  background: linear-gradient(135deg, #8b0000 0%, #b22222 100%);
  box-shadow: 0 8px 32px rgba(139, 0, 0, 0.2);
}

.product-list-card {
  background: white;
  border: 1px solid rgba(139, 0, 0, 0.1);
}

.section-title {
  color: #8b0000;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

@media (max-width: 960px) {
  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 600px) {
  .section-title {
    font-size: 1.5rem;
  }
}

.section-divider {
  border-color: rgba(139, 0, 0, 0.2);
  border-width: 2px;
}

.product-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-header {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%) !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  padding: 20px !important;
  border-bottom: none !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 960px) {
  .table-header {
    font-size: 0.85rem !important;
    padding: 15px !important;
  }
}

@media (max-width: 600px) {
  .table-header {
    font-size: 0.75rem !important;
    padding: 10px !important;
  }

  .product-table {
    font-size: 0.85rem;
  }
}

.product-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.product-row:hover {
  background: linear-gradient(90deg, #fff5f5 0%, #ffe4e1 100%) !important;
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.1);
}

.product-row:last-child {
  border-bottom: none;
}

.product-name {
  color: #8b0000;
  font-weight: 600;
  font-size: 1rem;
}

.product-data {
  color: #666;
  font-weight: 500;
  font-size: 0.95rem;
}

.product-price {
  color: #2e7d32;
  font-weight: 600;
  font-size: 1rem;
}

.product-total {
  color: #8b0000;
  font-weight: 700;
  font-size: 1.05rem;
}

.action-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.edit-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: white !important;
}

.edit-btn:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4) !important;
}

.delete-btn {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%) !important;
  color: white !important;
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4) !important;
}

.empty-state-icon {
  background: linear-gradient(135deg, #ffe4e1 0%, #fff5f5 100%);
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(139, 0, 0, 0.1);
}

.empty-state-text {
  color: #666;
  font-size: 1.25rem;
  line-height: 1.6;
}

.dialog-card {
  border: 2px solid rgba(139, 0, 0, 0.1);
}

.dialog-header {
  background: linear-gradient(135deg, #8b0000 0%, #b22222 100%);
  border-bottom: 3px solid #dc143c;
}

.dialog-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.delete-dialog-header {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  border-bottom: 3px solid #b71c1c;
}

.warning-dialog-header {
  background: linear-gradient(135deg, #d60222 0%, #ef6c00 100%);
  border-bottom: 3px solid #e65100;
}

.form-field :deep(.v-field) {
  border: 2px solid rgba(139, 0, 0, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.form-field :deep(.v-field:hover) {
  border-color: #b22222;
}

.form-field :deep(.v-field--focused) {
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.total-price-field :deep(.v-field) {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%);
  font-weight: 700;
  color: #8b0000;
}

.cancel-btn {
  color: #666 !important;
  border: 2px solid #ddd !important;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #999 !important;
  background: #f5f5f5 !important;
}

.save-btn {
  background: linear-gradient(135deg, #8b0000 0%, #b22222 100%) !important;
  color: white !important;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: linear-gradient(135deg, #b22222 0%, #dc143c 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(139, 0, 0, 0.4) !important;
}

.delete-confirm-btn {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%) !important;
  color: white !important;
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.delete-confirm-btn:hover {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(211, 47, 47, 0.4) !important;
}

.edit-old-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.add-new-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.update-stock-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
