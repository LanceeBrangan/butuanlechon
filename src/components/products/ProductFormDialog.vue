<script setup>
import { ref, computed, watch } from 'vue'
import { useBranchesStore } from '@/stores/branches'
import { useAuthUserStore } from '@/stores/authUser'
import { storeToRefs } from 'pinia'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  isEditMode: { type: Boolean, default: false },
  initialForm: { type: Object, default: () => ({}) },
  currentDate: { type: String, default: '' },
  existingProducts: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save'])

const authStore = useAuthUserStore()
const branchesStore = useBranchesStore()
const { branches } = storeToRefs(branchesStore)

const isSuperAdmin = computed(() => authStore.userRole === 'Super Administrator')

// Load branches for Super Admin dropdown
watch(() => props.modelValue, async (open) => {
  if (open && isSuperAdmin.value && branches.value.length === 0) {
    await branchesStore.getBranches()
  }
})

const onProductSelect = (val) => {
  if (val && typeof val === 'object') {
    productForm.value.name = val.name
    productForm.value.unit = val.unit
  } else {
    productForm.value.name = val
  }
}

const valid = ref(false)
const productFormRef = ref(null)
const productForm = ref({ ...props.initialForm })

watch(() => props.initialForm, (val) => {
  productForm.value = { ...val }
}, { deep: true })

const totalPrice = computed(() => productForm.value.quantity * productForm.value.price || 0)

const nameRules     = [(v) => !!v || 'Product name is required', (v) => (v && v.length >= 2) || 'Must be at least 2 characters']
const quantityRules = [(v) => !!v || 'Quantity is required', (v) => v > 0 || 'Must be greater than 0']
const unitRules     = [(v) => !!v || 'Unit is required']
const priceRules    = [(v) => !!v || 'Price is required', (v) => v > 0 || 'Must be greater than 0']
const branchRules   = [(v) => !!v || 'Branch is required']

const close = () => {
  emit('update:modelValue', false)
  productFormRef.value?.reset()
}

const save = () => {
  if (!valid.value) return
  emit('save', { ...productForm.value, totalPrice: totalPrice.value }, productForm.value.purchaseDate)
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="580px" persistent>
    <v-card class="dlg-card" rounded="xl" elevation="12">
      <div class="dlg-header px-8 py-6">
        <div class="d-flex align-center ga-3">
          <v-icon size="26" color="white">{{ isEditMode ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline' }}</v-icon>
          <span class="dlg-title">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</span>
        </div>
      </div>

      <v-card-text class="px-8 py-6">
        <v-form ref="productFormRef" v-model="valid">
          <v-row>

            <!-- Branch selector — Super Admin only -->
            <v-col cols="12" v-if="isSuperAdmin && !isEditMode">
              <v-select
                v-model="productForm.branch_id"
                :items="branches"
                item-title="name"
                item-value="id"
                label="Branch"
                :rules="branchRules"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-store-outline"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-combobox
                v-model="productForm.name"
                :items="existingProducts"
                item-title="name"
                label="Product Name"
                :rules="nameRules"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-food-variant"
                density="comfortable"
                @update:model-value="onProductSelect"
              />
            </v-col>

            <v-col cols="12" v-if="!isEditMode">
              <v-text-field
                v-model="productForm.purchaseDate"
                label="Purchase Date"
                type="date"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-calendar-outline"
                density="comfortable"
              />
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
                density="comfortable"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="productForm.unit"
                label="Unit"
                :rules="unitRules"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-scale"
                density="comfortable"
                placeholder="kg, pcs, L..."
              />
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
                density="comfortable"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                :model-value="totalPrice"
                label="Total Price"
                readonly
                variant="outlined"
                class="form-field total-price-field"
                prepend-inner-icon="mdi-calculator"
                density="comfortable"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="productForm.shelfLifeDays"
                label="Shelf Life (days)"
                type="number"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-clock-outline"
                density="comfortable"
                placeholder="e.g. 3 for meat"
                hint="Leave blank if non-perishable"
                persistent-hint
              />
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-8 pb-6 pt-0 d-flex ga-3 justify-end">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" @click="close">Cancel</v-btn>
        <v-btn class="dlg-confirm-btn" rounded="lg" elevation="0" @click="save" :disabled="!valid">
          <v-icon start size="18">{{ isEditMode ? 'mdi-content-save-outline' : 'mdi-plus' }}</v-icon>
          {{ isEditMode ? 'Save Changes' : 'Add Product' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-header { background: linear-gradient(120deg, #7b0000, #c62828); }
.dlg-title { color: #fff; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.2px; }
.dlg-cancel-btn {
  color: #555 !important;
  border-color: #ddd !important;
  text-transform: none !important;
  font-weight: 600 !important;
}
.dlg-confirm-btn {
  background: linear-gradient(135deg, #7b0000, #b71c1c) !important;
  color: #fff !important;
  text-transform: none !important;
  font-weight: 700 !important;
}
.dlg-confirm-btn:hover {
  background: linear-gradient(135deg, #9b0000, #c62828) !important;
  box-shadow: 0 4px 16px rgba(139, 0, 0, 0.35) !important;
}
.form-field :deep(.v-field) { border-radius: 10px; transition: all 0.2s ease; }
.form-field :deep(.v-field--focused) { box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1); }
.total-price-field :deep(.v-field) { background: #fff9f9; }
.total-price-field :deep(.v-field input) { font-weight: 700; color: #8b0000; }
</style>
