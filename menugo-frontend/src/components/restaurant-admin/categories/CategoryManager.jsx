import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { PlusIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import CategoryList from './CategoryList'
import CategoryModal from './CategoryModal'
import DragDropCategories from './DragDropCategories'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import EmptyState from '../../../common/EmptyState'
import { getCategories } from '../../../services/categoryService'
import { getMenuItems } from '../../../services/menuService'
import { useAuthStore } from '../../../store/authStore'

const CategoryManager = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const { user } = useAuthStore()

  const { data: categories, isLoading: isCategoriesLoading, refetch } = useQuery(
    ['categories', user?.restaurant_id],
    () => getCategories(user?.restaurant_id, true),
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

  const totalItems = categoriesWithCounts.reduce((count, category) => count + (category.itemCount || 0), 0)

  return (
    <div className="relative overflow-hidden space-y-6 bg-white p-4 sm:p-6 lg:p-8 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant categories</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Category Management</h1>
            <p className="text-sm leading-6 text-slate-500 sm:text-base">Organize your menu items into categories with an analytics-style workspace.</p>
          </div>
          <Button onClick={() => setShowModal(true)} icon={PlusIcon} className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 px-4 py-2.5 text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-blue-600">
            Add Category
          </Button>
        </div>

           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-500">Total categories</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{categoriesWithCounts.length}</p>
          </div>
          <div className="rounded-none bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold text-slate-500">Total menu items</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{totalItems}</p>
          </div>
            </div>

       {/* Drag & Drop Notice */}
       <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsDragging(!isDragging)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
            isDragging ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 shadow-sm'
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
    </div>
  )
}

export default CategoryManager