// stores/branches.js
import { supabase, supabaseAdmin, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBranchesStore = defineStore('branches', () => {
  const authStore = useAuthUserStore()

  const branchesTable = ref([])
  const branches = ref([])
  const branchesTotal = ref(0)

  function $reset() {
    branchesTable.value = []
    branches.value = []
    branchesTotal.value = 0
  }

  async function getBranchesTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name')
    search = tableSearch(search)

    const { data } = await supabase
      .from('branches')
      .select()
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    const { count } = await getBranchesCount({ search })

    branchesTable.value = data
    branchesTotal.value = count
  }

  async function getBranchesCount({ search }) {
    return await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
  }

  async function getBranches() {
    const { data } = await supabase.from('branches').select().order('name', { ascending: true })

    if (authStore.userRole === 'Super Administrator') {
      branches.value = data
    } else {
      const authBranches = authStore.userData.branch.split(',')
      branches.value = data.filter((b) => authBranches.includes(b.name))
    }
  }

  // ✅ Use supabaseAdmin for writes to bypass RLS (Super Admin only actions)
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
    $reset, getBranchesTable, getBranches,
    addBranch, updateBranch, deleteBranch,
  }
})
