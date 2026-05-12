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

  // ✅ Reads use supabase (user JWT) — RLS handles what each role can see
  async function getBranches() {
    const { data } = await supabase
      .from('branches')
      .select()
      .order('name', { ascending: true })

    branches.value = data ?? []
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
    branchesTable.value = data ?? []
    branchesTotal.value = count
  }

  async function getBranchesCount({ search }) {
    return await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
  }

  // ✅ Writes use supabase — RLS "Super Admin - branches" policy restricts to Super Admin only
  async function addBranch(formData) {
    return await supabase.from('branches').insert([formData]).select()
  }

  async function updateBranch(formData) {
    return await supabase.from('branches').update(formData).eq('id', formData.id).select()
  }

  async function deleteBranch(id) {
    return await supabase.from('branches').delete().eq('id', id)
  }

  return {
    branchesTable, branches, branchesTotal,
    $reset, getBranches, getBranchesTable, getBranchesCount,
    addBranch, updateBranch, deleteBranch,
  }
})
