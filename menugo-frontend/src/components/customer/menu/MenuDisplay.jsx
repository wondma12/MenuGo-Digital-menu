import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
import { getRestaurantMenu } from '../../../services/menuService'

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

  const { data, isLoading, error } = useQuery(['restaurantMenu', restaurantId], () => getRestaurantMenu(restaurantId))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selectedCategory])

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
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
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
            <MenuGridView items={filteredItems} onItemClick={setSelectedItem} />
          ) : (
            <MenuListView items={filteredItems} onItemClick={setSelectedItem} />
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
    </div>
  )
}

export default MenuDisplay