import { supabase, formActionDefault } from '@/utils/supabase.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'



export function useRegister() {
  // Utilize pre-defined vue functions
  const router = useRouter()

  // Load Variables
  const formDataDefault = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: null,
  }
  const formData = ref({
    ...formDataDefault,
  })
  const formAction = ref({
    ...formActionDefault,
  })
  const refVForm = ref()




  // Register Functionality
  const onSubmit = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }


    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          firstname: formData.value.firstname,
          lastname: formData.value.lastname,
          role: formData.value.role,
        }
      }
    })

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
    } if (data) {
  formAction.value.formSuccessMessage = 'Successfully Registered Account.'
  // Redirect to confirmation page (pass email as query param)
  router.replace(`/confirmation?email=${formData.value.email}`)
}


    // Reset Form
    refVForm.value?.reset()
    // Turn off processing
    formAction.value.formProcess = false
  }



  // Trigger Validators
  const onFormSubmit = () => {
    refVForm.value?.validate().then(({ valid }) => {
      if (valid) onSubmit()
    })
  }

  return { formData, formAction, refVForm, onFormSubmit }
}
