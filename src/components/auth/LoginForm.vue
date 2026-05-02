<script setup>
import { ref } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { useLogin } from '@/composables/auth/login'
import AlertNotification from '@/common/AlertNotification.vue'

const { formData, formAction, refVForm, onFormSubmit } = useLogin()

const isPasswordVisible = ref(false)
</script>

<template>
  <div>
    <AlertNotification
      :form-success-message="formAction.formSuccessMessage"
      :form-error-message="formAction.formErrorMessage"
    />
    <v-form ref="refVForm" @submit.prevent="onFormSubmit">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model="formData.email"
            label="Email"
            prepend-inner-icon="mdi-email-outline"
            :rules="[requiredValidator, emailValidator]"
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="formData.password"
            prepend-inner-icon="mdi-lock-outline"
            label="Password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="isPasswordVisible = !isPasswordVisible"
            :rules="[requiredValidator]"
          ></v-text-field>
        </v-col>

        <v-col cols="12" class="d-flex justify-end pa-1">
          <v-btn
            variant="text"
            class="text-body-2 text-sm-body-1"
            size="small"
            color="red-darken-4"
            @click="$router.push('/reset-password')"
          >
            Forgot Password?
          </v-btn>
        </v-col>
      </v-row>

      <v-btn
        class="mt-2"
        type="submit"
        color="red-darken-4"
        prepend-icon="mdi-login"
        :disabled="formAction.formProcess"
        :loading="formAction.formProcess"
        block
      >
        Login
      </v-btn>
    </v-form>
  </div>
</template>
