import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import CategoryList from './CategoryList'
import CategoryCard from './CategoryCard'
import CategoryModal from './CategoryModal'
import DragDropCategories from './DragDropCategories'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import { getCategories } from '../../../services/categoryService'
import { getMenuItems } from '../../../services/menuService'
import { useAuthStore } from '../../../store/authStore'

const CategoryManager = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const { user } = useAuthStore()

  const { data: categories, isLoading: isCategoriesLoading, refetch } = useQuery(
    ['categories', user?.restaurant_id],
    () => getCategories(user?.restaurant_id),
    { enabled: !!user?.restaurant_id }
  )

  const { data: menuData, isLoading: isMenuLoading } = useQuery(
    ['menuItems', user?.restaurant_id],
    () => getMenuItems(user?.restaurant_id),
    { enabled: !!user?.restaurant_id }
  )

  if (isCategoriesLoading || isMenuLoading) return <Loading />

  // Compute item counts per category using fetched menu items
  const items = menuData?.items || []
  const categoriesWithCounts = (categories || []).map((cat) => ({
    ...cat,
    itemCount: items.filter((it) => it.categoryId === cat.id).length,
  }))

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleSuccess = () => {
    refetch()
    setShowModal(false)
    setEditingCategory(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 mt-1">Organize your menu items into categories</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
            >
              List
            </button>
          </div>
          <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Drag & Drop Notice */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsDragging(!isDragging)}
          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
            isDragging ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <ArrowsUpDownIcon className="w-4 h-4" />
          {isDragging ? 'Done' : 'Reorder Categories'}
        </button>
      </div>

      {/* Categories Display */}
      {categories?.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize your menu"
          actionText="Add Category"
          onAction={() => setShowModal(true)}
        />
      ) : isDragging ? (
        <DragDropCategories categories={categories} onReorder={refetch} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoriesWithCounts?.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategoryCard
                category={category}
                onEdit={() => handleEdit(category)}
                onRefresh={refetch}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <CategoryList
          categories={categoriesWithCounts || []}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default CategoryManager