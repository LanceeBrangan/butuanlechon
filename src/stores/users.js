// stores/users.js
import { supabaseAdmin } from '@/utils/supabaseAdmin'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsersStore = defineStore('users', () => {
  const usersTable = ref([])
  const usersTotal = ref(0)

  // Fetch paginated users for the table
  const getUsersTable = async ({ page, itemsPerPage }) => {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: itemsPerPage,
    })

    if (error) return { error }

    usersTable.value = data.users
    usersTotal.value = data.total ?? data.users.length
    return { data }
  }

  // Add user — Super Admin creates user with full metadata
  const addUser = async (formData) => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true, // skip email confirmation
      user_metadata: {
        firstname: formData.firstname,
        middlename: formData.middlename,
        lastname: formData.lastname,
        phone: formData.phone,
        branch: Array.isArray(formData.branch) ? formData.branch.join(',') : formData.branch,
        user_role: formData.user_role,
        is_admin: formData.user_role === 'Super Administrator',
      },
    })

    return { data, error }
  }

  // Update user metadata (and optionally password)
  const updateUser = async (formData) => {
    const updatePayload = {
      user_metadata: {
        firstname: formData.firstname,
        middlename: formData.middlename,
        lastname: formData.lastname,
        phone: formData.phone,
        branch: Array.isArray(formData.branch) ? formData.branch.join(',') : formData.branch,
        user_role: formData.user_role,
        is_admin: formData.user_role === 'Super Administrator',
      },
    }

    // Only update password if provided
    if (formData.password) {
      updatePayload.password = formData.password
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      formData.id,
      updatePayload
    )

    return { data, error }
  }

  // Delete user
  const deleteUser = async (userId) => {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    return { data, error }
  }

  return { usersTable, usersTotal, getUsersTable, addUser, updateUser, deleteUser }
})
