<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  currentDate: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const additionalQuantity = ref(0)
const additionalPricePerUnit = ref(0)

const additionalTotalPrice = computed(() =>
  additionalQuantity.value * additionalPricePerUnit.value || 0
)

const newQuantity = computed(() =>
  Number(props.product?.quantity || 0) + Number(additionalQuantity.value || 0)
)

const avgPrice = computed(() => {
  const oldVal = (props.product?.quantity || 0) * (props.product?.price || 0)
  return (oldVal + additionalTotalPrice.value) / (newQuantity.value || 1)
})

const newTotalValue = computed(() =>
  (props.product?.quantity || 0) * (props.product?.price || 0) + additionalTotalPrice.value
)

const isDisabled = computed(() =>
  !additionalQuantity.value || additionalQuantity.value <= 0 ||
  !additionalPricePerUnit.value || additionalPricePerUnit.value <= 0
)

const close = () => {
  additionalQuantity.value = 0
  additionalPricePerUnit.value = 0
  emit('update:modelValue', false)
}

const confirm = () => {
  if (isDisabled.value) return

  const updatedProduct = {
    ...props.product,
    quantity: newQuantity.value,
    price: avgPrice.value,
    totalPrice: newQuantity.value * avgPrice.value,
    _additionalExpense: additionalTotalPrice.value,
    _addedOnDate: props.currentDate,
  }

  emit('confirm', updatedProduct)
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="620px" persistent>
    <v-card class="dlg-card" rounded="xl" elevation="12">
      <div class="dlg-header px-8 py-6">
        <div class="d-flex align-center ga-3">
          <v-icon size="26" color="white">mdi-package-variant-plus</v-icon>
          <span class="dlg-title">Update Stock — {{ product?.name }}</span>
        </div>
      </div>

      <v-card-text class="px-8 py-6">
        <!-- Current stock summary -->
        <div class="stock-summary mb-6">
          <div class="stock-summary-row">
            <span class="ss-label">Current Quantity</span>
            <span class="ss-val">{{ product?.quantity }} {{ product?.unit }}</span>
          </div>
          <div class="stock-summary-row">
            <span class="ss-label">Price / Unit</span>
            <span class="ss-val">₱{{ product?.price?.toLocaleString() }}</span>
          </div>
          <div class="stock-summary-row">
            <span class="ss-label">Total Value</span>
            <span class="ss-val ss-val--bold">₱{{ product?.totalPrice?.toLocaleString() }}</span>
          </div>
        </div>

        <p class="field-section-label mb-4">Adding New Stock — {{ currentDate }}</p>

        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="additionalQuantity"
              label="Additional Quantity"
              type="number"
              variant="outlined"
              class="form-field"
              prepend-inner-icon="mdi-plus"
              density="comfortable"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="additionalPricePerUnit"
              label="Price per Unit"
              type="number"
              variant="outlined"
              class="form-field"
              prepend-inner-icon="mdi-currency-php"
              density="comfortable"
            />
          </v-col>
        </v-row>

        <div class="cost-today-box mb-4">
          <span class="cost-label">Additional Cost Today</span>
          <span class="cost-value">₱{{ additionalTotalPrice.toLocaleString() }}</span>
        </div>

        <div class="preview-box">
          <p class="preview-label mb-3">After Update Preview</p>
          <div class="preview-row">
            <span>New Quantity</span>
            <strong>{{ newQuantity }} {{ product?.unit }}</strong>
          </div>
          <div class="preview-row">
            <span>Avg Price / Unit</span>
            <strong>₱{{ avgPrice.toFixed(2) }}</strong>
          </div>
          <div class="preview-row">
            <span>New Total Value</span>
            <strong>₱{{ newTotalValue.toLocaleString() }}</strong>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-8 pb-6 pt-0 d-flex ga-3 justify-end">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" @click="close">Cancel</v-btn>
        <v-btn
          class="dlg-confirm-btn"
          rounded="lg"
          elevation="0"
          color="success"
          @click="confirm"
          :disabled="isDisabled"
        >
          <v-icon start size="18">mdi-check</v-icon>
          Confirm Update
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
  text-transform: none !important;
  font-weight: 700 !important;
}
.stock-summary {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #eee;
}
.stock-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}
.stock-summary-row:last-child { border-bottom: none; }
.ss-label { font-size: 0.8rem; color: #666; }
.ss-val   { font-size: 0.88rem; font-weight: 600; color: #1a1a1a; }
.ss-val--bold { color: #8b0000; font-weight: 800; }
.field-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #8b0000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cost-today-box {
  background: #f1faf2;
  border: 1px solid #a5d6a7;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cost-label { font-size: 0.82rem; font-weight: 600; color: #2e7d32; }
.cost-value { font-size: 1.25rem; font-weight: 800; color: #2e7d32; }
.preview-box {
  background: #f4f5f7;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
}
.preview-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #333;
  padding: 4px 0;
  border-bottom: 1px dashed #e0e0e0;
}
.preview-row:last-child { border-bottom: none; }
.preview-row strong { color: #8b0000; }
.form-field :deep(.v-field) { border-radius: 10px; transition: all 0.2s ease; }
.form-field :deep(.v-field--focused) { box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1); }
</style>
