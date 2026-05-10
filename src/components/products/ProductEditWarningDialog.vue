<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'proceed-edit', 'update-stock'])

const close = () => emit('update:modelValue', false)

const proceedEdit = () => {
  emit('proceed-edit', props.product)
  close()
}

const updateStock = () => {
  emit('update-stock')
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="560px">
    <v-card class="dlg-card" rounded="xl" elevation="12">
      <div class="dlg-header px-8 py-6">
        <div class="d-flex align-center ga-3">
          <v-icon size="28" color="white">mdi-alert-outline</v-icon>
          <span class="dlg-title">Old Stock — Edit Warning</span>
        </div>
      </div>

      <v-card-text class="px-8 py-6">
        <p class="text-body-1 mb-4">
          This product was purchased on
          <strong class="text-warning">{{ product?.purchaseDate }}</strong>.
          What would you like to do?
        </p>

        <div class="choice-grid">
          <div class="choice-card choice-card--green" @click="updateStock">
            <v-icon size="28" color="success" class="mb-2">mdi-package-variant-plus</v-icon>
            <p class="choice-title">Add New Stock</p>
            <p class="choice-desc">Adds qty & cost to today's records</p>
          </div>
          <div class="choice-card choice-card--blue" @click="proceedEdit">
            <v-icon size="28" color="info" class="mb-2">mdi-pencil-outline</v-icon>
            <p class="choice-title">Edit Old Entry</p>
            <p class="choice-desc">Fix a typo or wrong price from before</p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-8 pb-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" rounded="lg" class="dlg-cancel-btn" @click="close">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-header { background: linear-gradient(120deg, #b71c1c, #e65100); }
.dlg-title { color: #fff; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.2px; }
.dlg-cancel-btn {
  color: #555 !important;
  text-transform: none !important;
  font-weight: 600 !important;
}
.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}
.choice-card {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 18px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.choice-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.choice-card--green { background: #f1faf2; border-color: #a5d6a7; }
.choice-card--green:hover { border-color: #4caf50; }
.choice-card--blue  { background: #e8f4fd; border-color: #90caf9; }
.choice-card--blue:hover  { border-color: #1976d2; }
.choice-title { font-weight: 700; font-size: 0.9rem; color: #1a1a1a; margin: 4px 0 2px; }
.choice-desc  { font-size: 0.75rem; color: #666; margin: 0; }
</style>
