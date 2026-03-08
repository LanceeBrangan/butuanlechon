<script setup>
import { useRouter } from 'vue-router'

const emit = defineEmits(['update:modelValue'])
const router = useRouter()

const handleClose = () => {
  emit('update:modelValue', false)
  router.push('/')
}

const handleResendEmail = () => {
  // TODO: Implement resend email functionality
  console.log('Resend email requested for:', props.email)
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    persistent
    width="100%"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" class="text-center pa-6">
      <!-- Icon Section -->
      <div class="mb-4">
        <v-icon size="80" color="success" class="d-block mx-auto">
          mdi-email-check
        </v-icon>
      </div>

      <!-- Title -->
      <h1 class="text-h5 font-weight-bold mb-2">Confirmation Email Sent</h1>

      <!-- Message -->
      <p class="text-body2 text-grey-darken-1 mb-3">
        We've sent a confirmation email to:
      </p>

      <p class="text-body1 font-weight-bold text-primary mb-6 px-4">
        {{ email }}
      </p>

      <!-- Description -->
      <p class="text-body2 text-grey-darken-1 mb-6 px-2">
        Please check your email and click the confirmation link to activate your account.
        The link will expire in 24 hours.
      </p>

      <!-- Important Note -->
      <v-alert
        type="info"
        variant="tonal"
        class="mb-6"
        icon="mdi-information"
      >
        <span class="text-caption">
          Didn't receive the email? Check your spam or junk folder.
        </span>
      </v-alert>

      <!-- Actions -->
      <div class="d-flex gap-3 flex-column flex-sm-row">
        <v-btn
          variant="tonal"
          color="primary"
          class="flex-grow-1"
          @click="handleResendEmail"
        >
          <v-icon start>mdi-email-resend</v-icon>
          Resend Email
        </v-btn>

        <v-btn
          variant="flat"
          color="primary"
          class="flex-grow-1"
          @click="handleClose"
        >
          <v-icon start>mdi-login</v-icon>
          Back to Login
        </v-btn>
      </div>

      <!-- Footer note -->
      <p class="text-caption text-grey mt-4">
        Once confirmed, you'll be able to log in with your credentials
      </p>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
