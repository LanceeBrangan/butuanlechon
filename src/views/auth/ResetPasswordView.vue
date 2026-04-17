<script setup>
import ResetPassword from '@/components/auth/ResetPassword.vue'


onMounted(() => {
  const hash = window.location.hash

  if (!hash.includes('access_token')) {
    router.push('/')
  }
})

</script>

<template>
  <v-responsive>
    <v-app>
      <v-main>
        <v-container fluid class="fill-height pa-0">
          <v-row class="ma-0" no-gutters>


            <!-- Right side - Reset Password Card -->
            <v-col
              cols="12"
              sm="12"
              md="6"
              class="d-flex justify-center align-center pa-4 pa-sm-6 pa-md-8"
            >
              <v-card
                class="elevation-12 pa-4 pa-sm-6 pa-md-8"
                prepend-icon="mdi-lock-reset"
                subtitle="Password Recovery Page"
                max-width="500"
                width="100%"
                rounded="xl"
              >
                <template v-slot:title>
                  <span class="font-weight-black text-h6 text-sm-h5"> BL & SG Restaurant </span>
                </template>

                <ResetPassword></ResetPassword>

                <v-divider class="my-4 my-sm-5"></v-divider>

                <h5 class="text-center mt-5 text-body-2 text-sm-body-1">
                  Remember your password?
                  <router-link
                    to="/"
                    color="red-darken-4"
                    class="text-decoration-none text-red-darken-4"
                    >Login Here</router-link
                  >
                </h5>
              </v-card>
            </v-col>

              <!-- Left side - Image -->
            <v-col cols="12" md="6" class="d-flex justify-center align-center pa-4 pa-md-8">
              <v-avatar class="hero-avatar elevation-4 floating">
                <v-img src="/images/Background.png" cover alt="logo" />
              </v-avatar>
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
  background-image: url('/images/LogInBG.png');
  background-size: cover;
}
.hero-avatar {
  width: 70vw;
  max-width: 350px;
  height: 70vw;
  max-height: 350px;
}
.floating {
  animation: floatY 4s ease-in-out infinite;
}

@keyframes floatY {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
  80% {
    transform: translateY(0);
  }
}
</style>
