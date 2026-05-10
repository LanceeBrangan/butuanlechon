import { supabase, supabaseAdmin, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBranchesStore = defineStore('branches', () => {
  const authStore = useAuthUserStore()

  const branchesTable = ref([])
  const branches = ref([])
  const branchesTotal = ref(0)

  // ✅ Use supabaseAdmin for Super Admin, supabase for regular users
  const getClient = () =>
    authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase

  function $reset() {
    branchesTable.value = []
    branches.value = []
    branchesTotal.value = 0
  }

  async function getBranches() {
    const { data } = await getClient()
      .from('branches')
      .select()
      .order('name', { ascending: true })

    branches.value = data ?? []
  }

  async function getBranchesTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name')
    search = tableSearch(search)

    const { data } = await getClient()
      .from('branches')
      .select()
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    const { count } = await getBranchesCount({ search })
    branchesTable.value = data ?? []
    branchesTotal.value = count
  }

  async function getBranchesCount({ search }) {
    return await getClient()
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
  }

  // Writes are always Super Admin only — always use supabaseAdmin
  async function addBranch(formData) {
    return await supabaseAdmin.from('branches').insert([formData]).select()
  }

  async function updateBranch(formData) {
    return await supabaseAdmin.from('branches').update(formData).eq('id', formData.id).select()
  }

  async function deleteBranch(id) {
    return await supabaseAdmin.from('branches').delete().eq('id', id)
  }

  return {
    branchesTable, branches, branchesTotal,
    $reset, getBranches, getBranchesTable, getBranchesCount,
    addBranch, updateBranch, deleteBranch,
  }
})
