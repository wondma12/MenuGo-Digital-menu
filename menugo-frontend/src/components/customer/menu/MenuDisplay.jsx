import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import RestaurantHeader from './RestaurantHeader'
import CategoryTabs from './CategoryTabs'
import MenuGridView from './MenuGridView'
import SearchBar from './SearchBar'
import FilterDrawer from './FilterDrawer'
import MenuItemModal from './MenuItemModal'
import Loading from '../../common/Loading'
import FeedbackModal from '../feedback/FeedbackModal'
import CallModal from '../calls/CallModal'
import { useCartStore } from '../../../store/cartStore'
import { getRestaurantMenu, getMenuItem } from '../../../services/menuService'
import { getOrders } from '../../../services/orderService'
import { getPublicCoupons } from '../../../services/promotionService'

const MenuDisplay = () => {
  const { restaurantId } = useParams()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: Infinity },
    spiceLevel: 'all'
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { setTableNumber, tableNumber: currentTable } = useCartStore((s) => ({ setTableNumber: s.setTableNumber, tableNumber: s.tableNumber }))

  const { data, isLoading, error } = useQuery(['restaurantMenu', restaurantId], () => getRestaurantMenu(restaurantId))
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const { data: promotionsData } = useQuery(['publicCoupons', restaurantId], () => getPublicCoupons(restaurantId), { enabled: !!restaurantId })
  const promotions = promotionsData || []
  // Pre-fill table number from QR query (?table=...)
  useEffect(() => {
    const tableParam = searchParams.get('table')
    if (tableParam) {
      setTableNumber(tableParam)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const categories = data?.categories || []
  const menuItems = data?.items || []

  // Auto-select category from query param (e.g. ?category=chicken)
  useEffect(() => {
    const catParam = searchParams.get('category')
    if (catParam && categories.length > 0) {
      const match = categories.find(c => ((c.name || '').toLowerCase() === catParam.toLowerCase()) || ((c.slug || '') && c.slug.toLowerCase() === catParam.toLowerCase()))
      if (match) setSelectedCategory(match.id)
    }
  }, [searchParams, categories])

  // Deep-link to item modal via ?item=<id>
  useEffect(() => {
    const itemParam = searchParams.get('item')
    if (!itemParam) return

    const found = menuItems.find(i => String(i.id) === String(itemParam))
    if (found) {
      setSelectedItem(found)
      return
    }

    // If not present in current page items, fetch single item
    let mounted = true
    const fetchItem = async () => {
      try {
        const single = await getMenuItem(itemParam)
        if (mounted && single) setSelectedItem(single)
      } catch (err) {
        // ignore
      }
    }
    fetchItem()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, menuItems])

  // Fetch orders for current table (so customers can see status of items they've ordered)
  const { data: tableOrdersPayload } = useQuery(
    ['customerTableOrders', restaurantId, currentTable],
    () => getOrders(restaurantId, { table: currentTable, status: 'all', limit: 50 }),
    { enabled: !!restaurantId && !!currentTable }
  )

  const tableOrders = React.useMemo(() => {
    if (!tableOrdersPayload) return []
    if (Array.isArray(tableOrdersPayload)) return tableOrdersPayload
    if (Array.isArray(tableOrdersPayload.orders)) return tableOrdersPayload.orders
    return []
  }, [tableOrdersPayload])

  // Open modals via query params: ?showCall=1 or ?showReview=1
  useEffect(() => {
    if (searchParams.get('showCall')) {
      setShowCallModal(true)
      const sp = new URLSearchParams(searchParams)
      sp.delete('showCall')
      setSearchParams(sp, { replace: true })
    }
    if (searchParams.get('showReview')) {
      setShowReviewModal(true)
      const sp2 = new URLSearchParams(searchParams)
      sp2.delete('showReview')
      setSearchParams(sp2, { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Build a map of menuItemId -> latest order status for quick lookup
  const itemStatusMap = React.useMemo(() => {
    const map = {}
    if (!Array.isArray(tableOrders)) return map
    tableOrders.forEach(order => {
      const ts = new Date(order.createdAt || order.created_at || null).getTime() || 0
      (order.items || []).forEach(it => {
        const id = it.itemId || it.menu_item_id || it.menuItemId || it.menu_item_id
        if (!id) return
        const prev = map[id]
        if (!prev || (prev._ts || 0) < ts) {
          map[id] = { status: order.status, orderNumber: order.orderNumber || order.order_number, _ts: ts }
        }
      })
    })
    return map
  }, [tableOrders])

  if (isLoading) return <Loading />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load menu</h2>
          <p className="text-gray-500 mt-2">The menu could not be loaded. The restaurant may not exist or the service is unavailable.</p>
        </div>
      </div>
    )
  }

  

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory
    const matchesFilterCategories = filters.categories.length === 0 || filters.categories.includes(String(item.categoryId)) || filters.categories.includes(item.categoryId)
    const name = (item.name || '').toString()
    const desc = (item.description || '').toString()
    const q = (searchQuery || '').toLowerCase()
    const matchesSearch = name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    const priceValue = typeof item.price === 'number' ? item.price : Number(item.price) || 0
    const matchesPrice = priceValue >= (filters.priceRange.min || 0) && priceValue <= (filters.priceRange.max || Infinity)
    const spiceVal = Number.isFinite(Number(item.spiceLevel)) ? Number(item.spiceLevel) : 0
    const matchesSpice = filters.spiceLevel === 'all' || spiceVal === parseInt(filters.spiceLevel)

    return matchesCategory && matchesFilterCategories && matchesSearch && matchesPrice && matchesSpice
  })

  return (
    <div className="min-h-screen bg-white font-['Manrope',system-ui,sans-serif] text-slate-900 pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-20 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-emerald-200/25 blur-3xl" />
      </div>
      <RestaurantHeader restaurant={data?.restaurant} />

      <div className="sticky top-0 z-20 -mt-1 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
          />
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          {promotions.length > 0 && (
            <div className="mb-5 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 p-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong className="block text-emerald-800 text-sm uppercase tracking-[0.2em]">Promotion</strong>
                  <span className="mt-1 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white">{promotions[0].code}</span>
                </div>
                <span className="text-sm text-slate-700 max-w-2xl">{promotions[0].description}</span>
              </div>
            </div>
          )}

          {/* FAB removed - actions moved to footer */}

          {/* Table selector removed: table selection is now handled at checkout */}

        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-white/70 shadow-sm"
            >
              <img src="/assets/empty-states/no-items.svg" alt="No items" className="w-48 h-48 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No items found</h3>
              <p className="text-slate-600 mt-1">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <MenuGridView items={filteredItems} onItemClick={setSelectedItem} itemStatuses={itemStatusMap} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        categories={categories}
      />

      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          restaurantId={restaurantId}
        />
      )}
      <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} restaurantId={restaurantId} />
      <FeedbackModal show={showReviewModal} onClose={() => setShowReviewModal(false)} restaurantId={restaurantId} onSubmitted={() => { /* optionally refetch reviews */ }} />
    </div>
  )
}

export default MenuDisplay