import { supabase, supabaseAdmin, tablePagination, tableSearch } from '@/utils/supabase'
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

  // ✅ Role-based client
  const getClient = () =>
    authStore.userRole === 'Super Administrator' ? supabaseAdmin : supabase

  function $reset() {
    productsTable.value = []
    productsTotal.value = 0
    products.value = []
    productsGraph.value = []
  }

  async function getProductsTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name')
    search = tableSearch(search)

    const { data } = await getClient()
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
    return await getClient()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
  }

  async function getProducts() {
    const { data } = await getClient()
      .from('products')
      .select()
      .order('name', { ascending: true })
    products.value = data ?? []
  }

  async function getProductsByBranch(branch_id) {
    const { data } = await getClient()
      .from('products')
      .select('name, stock_ins( qty_reweighed, branch_id, is_portion ), sale_products( qty, branch_id )')
      .eq('stock_ins.branch_id', branch_id)
      .eq('stock_ins.is_portion', true)
      .eq('sale_products.branch_id', branch_id)
      .order('name', { ascending: true })
    productsGraph.value = data ?? []
  }

  // ✅ Writes — Super Admin only, always use supabaseAdmin
  async function addProduct(formData) {
    if (formData.image) {
      formData.image_url = await updateProductImage(formData.image, formData.name)
      delete formData.image
    }
    return await supabaseAdmin.from('products').insert([formData]).select()
  }

  async function updateProduct(formData) {
    if (formData.image) {
      formData.image_url = await updateProductImage(formData.image, formData.name)
      delete formData.image
    }
    return await supabaseAdmin.from('products').update(formData).eq('id', formData.id).select()
  }

  async function deleteProduct(id) {
    return await supabaseAdmin.from('products').delete().eq('id', id)
  }

  async function updateProductImage(file, filename) {
    const { data } = await supabaseAdmin.storage
      .from('butuanlechon')
      .upload('products/' + getSlugText(filename) + '.png', file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (data) {
      const { data: imageData } = supabaseAdmin.storage
        .from('butuanlechon')
        .getPublicUrl(data.path)
      return imageData.publicUrl
    }
  }

  return {
    productsTable, productsTotal, products, productsGraph,
    $reset, getProductsTable, getProducts, getProductsByBranch,
    addProduct, updateProduct, deleteProduct, updateProductImage,
  }
})
