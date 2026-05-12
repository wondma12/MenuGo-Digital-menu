import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import RestaurantHeader from './RestaurantHeader'
import CategoryTabs from './CategoryTabs'
import MenuGridView from './MenuGridView'
import MenuListView from './MenuListView'
import SearchBar from './SearchBar'
import FilterDrawer from './FilterDrawer'
import MenuItemModal from './MenuItemModal'
import Loading from '../../common/Loading'
import RestaurantInfo from './RestaurantInfo'
import FeedbackModal from '../feedback/FeedbackModal'
import CallModal from '../calls/CallModal'
import { useCartStore } from '../../../store/cartStore'
import { getRestaurantMenu, getMenuItem } from '../../../services/menuService'
import { getOrders } from '../../../services/orderService'
import { getPublicCoupons } from '../../../services/promotionService'

const MenuDisplay = () => {
  const { restaurantId } = useParams()
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    dietary: [],
    priceRange: { min: 0, max: 100 },
    spiceLevel: 'all'
  })
  const [selectedItem, setSelectedItem] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const { setTableNumber, tableNumber: currentTable } = useCartStore((s) => ({ setTableNumber: s.setTableNumber, tableNumber: s.tableNumber }))

  const { data, isLoading, error } = useQuery(['restaurantMenu', restaurantId], () => getRestaurantMenu(restaurantId))
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const { data: promotionsData } = useQuery(['publicCoupons', restaurantId], () => getPublicCoupons(restaurantId), { enabled: !!restaurantId })
  const promotions = promotionsData || []
  // Scroll to top when changing category
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selectedCategory])

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
    const name = (item.name || '').toString()
    const desc = (item.description || '').toString()
    const q = (searchQuery || '').toLowerCase()
    const matchesSearch = name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    const matchesDietary = filters.dietary.length === 0 || filters.dietary.every(diet => !!item[diet])
    const priceValue = typeof item.price === 'number' ? item.price : Number(item.price) || 0
    const matchesPrice = priceValue >= (filters.priceRange.min || 0) && priceValue <= (filters.priceRange.max || Infinity)
    const spiceVal = Number.isFinite(Number(item.spiceLevel)) ? Number(item.spiceLevel) : 0
    const matchesSpice = filters.spiceLevel === 'all' || spiceVal === parseInt(filters.spiceLevel)

    return matchesCategory && matchesSearch && matchesDietary && matchesPrice && matchesSpice
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <RestaurantHeader restaurant={data?.restaurant} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2">
            <RestaurantInfo restaurant={data?.restaurant} />
          </div>
          
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryTabs
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      <motion.div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          {promotions.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
              <strong className="mr-2">Promotion:</strong>
              <span className="mr-2">{promotions[0].code}</span>
              <span className="text-gray-700">{promotions[0].description}</span>
            </div>
          )}

          {currentTable && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700">
              You are seated at <strong>Table {currentTable}</strong>. You can change this above.
            </div>
          )}

          {/* Expandable FAB for all screen sizes */}
          <div className="fixed right-4 bottom-6 md:right-6 md:bottom-24 z-50">
            <div style={{ transform: 'translateX(-6px)' }} className="relative">
              {fabOpen && (
                <div className="absolute bottom-16 right-0 flex flex-col items-end gap-2">
                  <button onClick={() => { setShowReviewModal(true); setFabOpen(false) }} className="w-28 sm:w-32 md:w-36 inline-flex items-center justify-center bg-primary-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-primary-700 text-sm">Leave a review</button>
                  <Link to="/login" onClick={() => setFabOpen(false)} className="w-28 sm:w-32 md:w-36 inline-flex items-center justify-center bg-primary-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-primary-700 text-sm">Staff Login</Link>
                  <button onClick={() => { setShowCallModal(true); setFabOpen(false) }} className="w-28 sm:w-32 md:w-36 inline-flex items-center justify-center bg-primary-600 text-white px-3 py-2 rounded-full shadow-lg hover:bg-primary-700 text-sm">Call Waiter</button>
                </div>
              )}

              <button aria-label="Open actions" onClick={() => setFabOpen(s => !s)} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center">
                <span className={`text-xl leading-none transform ${fabOpen ? 'rotate-45' : ''}`}>+</span>
              </button>
            </div>
          </div>

          {/* Table selector removed: table selection is now handled at checkout */}

        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <img src="/assets/empty-states/no-items.svg" alt="No items" className="w-48 h-48 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <MenuGridView items={filteredItems} onItemClick={setSelectedItem} itemStatuses={itemStatusMap} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <MenuListView items={filteredItems} onItemClick={setSelectedItem} itemStatuses={itemStatusMap} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
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