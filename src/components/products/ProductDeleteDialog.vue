<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const close = () => emit('update:modelValue', false)

const confirm = () => {
  emit('confirm')
  close()
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="460px">
    <v-card class="dlg-card" rounded="xl" elevation="12">
      <v-card-text class="px-8 pt-10 pb-6 text-center">
        <div class="delete-icon-wrap mb-5">
          <v-icon size="36" color="error">mdi-trash-can-outline</v-icon>
        </div>
        <p class="delete-title mb-2">Delete Product?</p>
        <p class="delete-name mb-2">{{ product?.name }}</p>
        <p class="delete-sub">This action is permanent and cannot be undone.</p>
      </v-card-text>
      <v-card-actions class="px-8 pb-8 d-flex ga-3 justify-center">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" style="min-width: 130px" @click="close">
          Cancel
        </v-btn>
        <v-btn color="error" variant="flat" rounded="lg" style="min-width: 130px" class="font-weight-bold" @click="confirm">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-cancel-btn {
  color: #555 !important;
  border-color: #ddd !important;
  text-transform: none !important;
  font-weight: 600 !important;
}
.delete-icon-wrap {
  width: 72px;
  height: 72px;
  background: #fff5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid #ffcdd2;
}
.delete-title { font-size: 1.2rem; font-weight: 800; color: #1a1a1a; }
.delete-name  { font-size: 1rem; font-weight: 700; color: #c62828; }
.delete-sub   { font-size: 0.82rem; color: #888; }
</style>
