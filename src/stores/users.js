// stores/users.js
import { supabaseAdmin } from '@/utils/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsersStore = defineStore('users', () => {
  const usersTable = ref([])
  const usersTotal = ref(0)

  function $reset() {
    usersTable.value = []
    usersTotal.value = 0
  }

  async function getUsersTable({ page, itemsPerPage }) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: itemsPerPage,
    })

    if (error) return { error }

    usersTable.value = data.users
    usersTotal.value = data.total ?? data.users.length
    return { data }
  }

  async function addUser(formData) {
    return await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        firstname: formData.firstname,
        middlename: formData.middlename ?? '',
        lastname: formData.lastname,
        phone: formData.phone,
        branch: Array.isArray(formData.branch)
          ? formData.branch.join(',')
          : formData.branch ?? '',
        user_role: formData.user_role,
        is_admin: formData.user_role === 'Super Administrator',
      },
    })
  }

  async function updateUser(formData) {
    const payload = {
      user_metadata: {
        firstname: formData.firstname,
        middlename: formData.middlename ?? '',
        lastname: formData.lastname,
        phone: formData.phone,
        branch: Array.isArray(formData.branch)
          ? formData.branch.join(',')
          : formData.branch ?? '',
        user_role: formData.user_role,
        is_admin: formData.user_role === 'Super Administrator',
      },
    }

    if (formData.password) payload.password = formData.password

    return await supabaseAdmin.auth.admin.updateUserById(formData.id, payload)
  }

  async function deleteUser(userId) {
    return await supabaseAdmin.auth.admin.deleteUser(userId)
  }

  return {
    usersTable, usersTotal,
    $reset, getUsersTable, addUser, updateUser, deleteUser,
  }
})
