<script setup>
import {
  mainNav,
  menuItemsNav1,
  menuItemsNav2,
  menuItemsNav3,
  menuItemsNav4,
  menuItemsNav5,
} from '@/components/layout/navigation/sideNavigation'
import AlertNotification from '@/common/AlertNotification.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useUserRolesStore } from '@/stores/userRoles'
import { requiredValidator } from '@/utils/validators'
import { useDisplay } from 'vuetify'
import { ref, watch, computed } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const userRolesStore = useUserRolesStore()

// Load Variables
const formDataDefault = {
  user_role: '',
  pages: [],
}
const formData = ref({
  ...formDataDefault,
})
const formAction = ref({
  ...formActionDefault,
})
const refVForm = ref()
const isUpdate = ref(false)
const openedPages = ref(mainNav.map((elem) => elem[0]))

// Map nav titles to their corresponding menu items
const navMenuMap = computed(() => ({
  [mainNav[0]?.[0]]: menuItemsNav1,
  [mainNav[1]?.[0]]: menuItemsNav2,
  [mainNav[2]?.[0]]: menuItemsNav3,
}))

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData
      ? { ...props.itemData, pages: props.itemData.pages.map((p) => p.page) }
      : { ...formDataDefault }
  },
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = isUpdate.value
    ? await userRolesStore.updateUserRole(formData.value)
    : await userRolesStore.addUserRole(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = isUpdate.value
      ? "Successfully Updated User Role's Pages"
      : 'Successfully Added User Role.'

    await userRolesStore.getUserRoles()

    // Form Reset and Close Dialog
    setTimeout(() => {
      onFormReset()
    }, 2500)
  }
}

// Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

// Form Reset
const onFormReset = () => {
  formAction.value = { ...formActionDefault }
  formData.value = { ...formDataDefault }
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '600'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
    scrollable
    @update:model-value="(val) => !val && emit('update:isDialogVisible', false)"
  >
    <v-card
      prepend-icon="mdi-tag"
      title="User Role"
      subtitle="Note: The Dashboard and Account Settings Page are accessible by default."
    >
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formData.user_role"
                label="Role Name"
                :rules="[requiredValidator]"
                :disabled="isUpdate"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-list v-model:opened="openedPages" density="compact" nav>
                <!-- Loop through mainNav and render nav groups with their corresponding menu items -->
                <v-list-group
                  v-for="([title, icon], navIndex) in mainNav"
                  :key="navIndex"
                  :value="title"
                >
                  <template #activator="{ props }">
                    <v-list-item v-bind="props" :prepend-icon="icon" :title="title"></v-list-item>
                  </template>

                  <!-- Render menu items for this nav group -->
                  <v-list-item
                    v-for="([itemTitle, itemIcon, itemSubtitle, itemPath], itemIndex) in navMenuMap[title] || []"
                    :key="itemIndex"
                    :prepend-icon="itemIcon"
                    :title="itemTitle"
                    :subtitle="itemSubtitle ?? undefined"
                  >
                    <template #append>
                      <v-list-item-action end>
                        <v-checkbox-btn v-model="formData.pages" :value="itemPath"></v-checkbox-btn>
                      </v-list-item-action>
                    </template>
                  </v-list-item>
                </v-list-group>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="red-darken-4"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            {{ isUpdate ? 'Update Role' : 'Add Role' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
