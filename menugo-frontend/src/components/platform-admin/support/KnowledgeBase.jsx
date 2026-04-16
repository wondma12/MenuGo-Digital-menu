import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import Loading from '../../../common/Loading'
import { getKnowledgeBaseArticles } from '../../../services/supportService'

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: articles, isLoading } = useQuery('knowledgeBase', getKnowledgeBaseArticles)

  const categories = [
    { id: 'all', name: 'All Articles' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'menu-management', name: 'Menu Management' },
    { id: 'orders', name: 'Orders' },
    { id: 'billing', name: 'Billing' },
    { id: 'faq', name: 'FAQ' },
  ]

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) return <Loading />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-500 mt-1">Find answers to common questions</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles?.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
            onClick={() => window.open(article.url, '_blank')}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <BookOpenIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">{article.readTime} min read</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{article.views} views</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredArticles?.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBase