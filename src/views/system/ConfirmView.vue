<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = ref(route.query.email || '')
const countdown = ref(300) // 5 minutes
const canResend = ref(false)

onMounted(() => {
  if (!email.value) {
    router.push('/')
  }

  // Start countdown timer
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      canResend.value = true
    }
  }, 1000)
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleResendEmail = async () => {
  // TODO: Implement resend email functionality
  console.log('Resend email requested for:', email.value)
  countdown.value = 300
  canResend.value = false
}

const handleBackToLogin = () => {
  router.push('/')
}
</script>

<template>
  <v-responsive>
    <v-app>
      <v-main>
        <v-container fluid class="fill-height d-flex flex-wrap">
          <v-row class="justify-center align-center">
            <v-col cols="12" sm="8" md="6" lg="4">
              <v-card
                class="elevation-12 pa-6"
                rounded="xl"
              >
                <!-- Success Icon -->
                <div class="text-center mb-4">
                  <v-icon size="100" color="success" class="d-block mx-auto">
                    mdi-email-check
                  </v-icon>
                </div>

                <!-- Title -->
                <h1 class="text-h5 font-weight-bold text-center mb-2">
                  Confirmation Email Sent
                </h1>

                <v-divider class="my-4"></v-divider>

                <!-- Content -->
                <div class="text-center mb-6">
                  <p class="text-body2 text-grey-darken-1 mb-2">
                    We've sent a confirmation email to:
                  </p>

                  <p class="text-body1 font-weight-bold text-primary mb-4 px-2">
                    {{ email }}
                  </p>

                  <p class="text-body2 text-grey-darken-1">
                    Please check your email and click the confirmation link to activate your account.
                    The link will expire in <span class="font-weight-bold">24 hours</span>.
                  </p>
                </div>

                <!-- Info Alert -->
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-6"
                  icon="mdi-information"
                  title="Didn't receive the email?"
                >
                  <span class="text-caption">
                    Check your spam or junk folder. Sometimes our emails end up there by mistake.
                  </span>
                </v-alert>

                <!-- Steps Card -->
                <v-card
                  variant="outlined"
                  class="mb-6 pa-4"
                  rounded="lg"
                >
                  <h4 class="text-subtitle2 font-weight-bold mb-3">What's next?</h4>
                  <ol class="text-caption text-grey-darken-1" style="margin-left: 20px;">
                    <li>Open the confirmation email</li>
                    <li>Click the verification link</li>
                    <li>Return here and sign in</li>
                  </ol>
                </v-card>

                <!-- Actions -->
                <div class="mb-4">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    class="w-100 mb-3"
                    @click="handleResendEmail"
                    :disabled="!canResend"
                  >
                    <v-icon start>mdi-email-resend</v-icon>
                    Resend Email
                    <span v-if="!canResend" class="ml-2 text-caption">
                      ({{ formatTime(countdown) }})
                    </span>
                  </v-btn>

                  <v-btn
                    variant="flat"
                    color="primary"
                    class="w-100"
                    @click="handleBackToLogin"
                  >
                    <v-icon start>mdi-login</v-icon>
                    Back to Login
                  </v-btn>
                </div>

                <!-- Footer -->
                <p class="text-caption text-grey text-center">
                  Once confirmed, you'll be able to sign in with your credentials
                </p>
              </v-card>

              <!-- Additional Tips -->
              <v-card
                class="mt-4 pa-4"
                rounded="lg"
                variant="tonal"
              >
                <h5 class="text-subtitle2 font-weight-bold mb-2">💡 Pro Tips</h5>
                <ul class="text-caption text-grey-darken-1" style="margin-left: 20px;">
                  <li>Check your email within 24 hours</li>
                  <li>The confirmation link is one-time use only</li>
                  <li>If the link expires, you can request a new one</li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-image: url('/images/RegisterBG.png');
  background-size: cover;
  background-attachment: fixed;
}

.w-100 {
  width: 100%;
}

ol, ul {
  padding-left: 0;
}

li {
  margin-bottom: 6px;
}
</style>
