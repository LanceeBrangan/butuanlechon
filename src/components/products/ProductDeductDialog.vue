<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  products: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedProductId = ref(null)
const deductQuantity = ref(0)

const close = () => {
  selectedProductId.value = null
  deductQuantity.value = 0
  emit('update:modelValue', false)
}

const submit = () => {
  if (!selectedProductId.value || deductQuantity.value <= 0) return
  emit('confirm', selectedProductId.value, Number(deductQuantity.value))
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="580px" persistent>
    <v-card class="dlg-card" rounded="xl" elevation="12">
      <div class="dlg-header px-8 py-6">
        <div class="d-flex align-center ga-3">
          <v-icon size="26" color="white">mdi-minus-circle-outline</v-icon>
          <span class="dlg-title">Deduct Product</span>
        </div>
      </div>

      <v-card-text class="px-8 py-6">
        <v-form>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedProductId"
                :items="products"
                item-title="name"
                item-value="id"
                label="Select Product"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-magnify"
                density="comfortable"
                hide-details="auto"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item
                    v-bind="itemProps"
                    :subtitle="`${item.raw.quantity} ${item.raw.unit} · ${item.raw.purchaseDate}`"
                  />
                </template>
                <template #selection="{ item }">
                  <span v-if="item.raw">{{ item.raw.name }} ({{ item.raw.quantity }} {{ item.raw.unit }})</span>
                </template>
              </v-select>
              <p class="text-caption text-grey mt-1">{{ products.length }} product(s) available</p>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="deductQuantity"
                type="number"
                label="Quantity to Deduct"
                variant="outlined"
                class="form-field"
                prepend-inner-icon="mdi-counter"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-8 pb-6 pt-0 d-flex ga-3 justify-end">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" @click="close">Cancel</v-btn>
        <v-btn
          color="error"
          variant="flat"
          rounded="lg"
          class="font-weight-bold"
          @click="submit"
          :disabled="!selectedProductId || deductQuantity <= 0"
        >
          <v-icon start size="18">mdi-minus</v-icon>
          Deduct
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-header { background: linear-gradient(120deg, #8b0000, #d32f2f); }
.dlg-title { color: #fff; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.2px; }
.dlg-cancel-btn {
  color: #555 !important;
  border-color: #ddd !important;
  text-transform: none !important;
  font-weight: 600 !important;
}
.form-field :deep(.v-field) { border-radius: 10px; transition: all 0.2s ease; }
.form-field :deep(.v-field--focused) { box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1); }
</style>
