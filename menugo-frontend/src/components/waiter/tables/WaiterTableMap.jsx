import React from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import WaiterTableCard from './WaiterTableCard'
import Loading from '../../common/Loading'
import { getWaiterTables } from '../../../services/waiterService'

const WaiterTableMap = () => {
  const { data: tables, isLoading } = useQuery('waiterTables', getWaiterTables, {
    refetchInterval: 10000
  })

  if (isLoading) return <Loading />

  const sections = [...new Set(tables?.map(t => t.section || 'General'))]

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{section}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables
              ?.filter(t => (t.section || 'General') === section)
              .map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WaiterTableCard table={table} />
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default WaiterTableMap