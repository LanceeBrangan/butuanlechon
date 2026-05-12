import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { getSlugText } from '@/utils/helpers'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const authStore = useAuthUserStore()

  const productsTable = ref([])
  const productsTotal = ref(0)
  const products = ref([])
  const productsGraph = ref([])

  function $reset() {
    productsTable.value = []
    productsTotal.value = 0
    products.value = []
    productsGraph.value = []
  }

  async function getProductsTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name')
    search = tableSearch(search)

    const { data } = await supabase  // ✅ not supabase()
      .from('products')
      .select()
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    const { count } = await getProductsCount({ search })
    productsTable.value = data ?? []
    productsTotal.value = count
  }

  async function getProductsCount({ search }) {
    return await supabase  // ✅ not supabase()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.
