import { supabase, formActionDefault } from '@/utils/supabase'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { resetSessionFlag } from '@/router'

async function logout() {
  await supabase.auth.signOut()
  resetSessionFlag()          // ← so next login gets a fresh JWT refresh
  router.push({ name: 'login' })
}

export function useResetPassword() {
  const router = useRouter()

  const formData = ref({
    password: '',
    passwordConfirm: '',
  })

  const formAction = ref({
    ...formActionDefault,
  })

  const refVForm = ref()
  const isValidSession = ref(false)

  // ✅ CHECK SESSION FROM EMAIL LINK
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      isValidSession.value = true
    } else {
      formAction.value.formErrorMessage =
        'Invalid or expired reset link. Please request a new one.'
      isValidSession.value = false
    }

    // Listen for recovery event
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        isValidSession.value = true
      }
    })
  }

  // ✅ SUBMIT NEW PASSWORD
  const onSubmit = async () => {
    formAction.value = { ...formActionDefault, formProcess: true }

    if (formData.value.password !== formData.value.passwordConfirm) {
      formAction.value.formErrorMessage = 'Passwords do not match.'
      formAction.value.formProcess = false
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: formData.value.password,
    })

    if (error) {
      formAction.value.formErrorMessage = error.message
    } else {
      // Sign out the user to clear the recovery session
      await supabase.auth.signOut()

      formAction.value.formSuccessMessage =
        'Password reset successfully! Redirecting to login...'

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    formAction.value.formProcess = false
  }

  const onFormSubmit = () => {
    refVForm.value?.validate().then(({ valid }) => {
      if (valid) onSubmit()
    })
  }

  return {
    formData,
    formAction,
    refVForm,
    isValidSession,
    onFormSubmit,
    checkSession,
  }
}
