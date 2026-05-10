<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue:  { type: Boolean, default: false },
  currentDate: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const tempDate = ref(null)

watch(() => props.modelValue, (val) => {
  if (val) tempDate.value = new Date(props.currentDate)
})

const confirm = () => {
  if (!tempDate.value) return
  let dateStr = ''
  if (typeof tempDate.value === 'string') {
    dateStr = tempDate.value
  } else if (tempDate.value instanceof Date) {
    const y = tempDate.value.getFullYear()
    const m = String(tempDate.value.getMonth() + 1).padStart(2, '0')
    const d = String(tempDate.value.getDate()).padStart(2, '0')
    dateStr = `${y}-${m}-${d}`
  }
  emit('confirm', dateStr)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="400px">
    <v-card rounded="xl" elevation="12" class="dlg-card">
      <div class="dlg-header px-6 py-5">
        <div class="d-flex align-center ga-3">
          <v-icon size="22" color="white">mdi-calendar-edit</v-icon>
          <span class="dlg-title">Change Business Date</span>
        </div>
      </div>
      <v-card-text class="pa-4">
        <v-date-picker v-model="tempDate" color="red-darken-2" show-adjacent-months elevation="0" />
      </v-card-text>
      <v-card-actions class="px-6 pb-5 d-flex ga-3 justify-end">
        <v-btn variant="outlined" rounded="lg" class="dlg-cancel-btn" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn variant="flat" color="error" rounded="lg" class="font-weight-bold" @click="confirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dlg-card { border: 1px solid rgba(0,0,0,0.07); overflow: hidden; }
.dlg-header { background: linear-gradient(120deg, #7b0000, #c62828); }
.dlg-title { color: #fff; font-size: 1.05rem; font-weight: 700; }
.dlg-cancel-btn { color: #555 !important; border-color: #ddd !important; text-transform: none !important; font-weight: 600 !important; }
</style>
