import {useEffect, useState} from 'react'
import { useQuery } from 'react-query'
import { getPublicTables } from '../../../services/tableService'
import { useCartStore } from '../../../store/cartStore'
import Loading from '../../common/Loading'

const TableSelector = ({ restaurantId, initialTable }) => {
  const { data, isLoading } = useQuery(['publicTables', restaurantId], () => getPublicTables(restaurantId), { enabled: !!restaurantId })
  const [selected, setSelected] = useState('')
  const setTableNumber = useCartStore((s) => s.setTableNumber)

  useEffect(() => {
    if (initialTable) {
      // initialTable can be a table number or table id; prefer tableNumber match
      const match = (data || []).find(t => String(t.table_number || t.tableNumber) === String(initialTable) || String(t.id) === String(initialTable))
      if (match) {
        const tn = match.tableNumber || match.table_number
        setSelected(String(tn))
        setTableNumber(String(tn))
      } else {
        // if no match, assume initialTable is a raw number
        setSelected(String(initialTable))
        setTableNumber(String(initialTable))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTable, data])

  const handleChange = (e) => {
    const value = e.target.value
    setSelected(value)
    setTableNumber(value)
  }

  if (isLoading) return <Loading />

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
      <select value={selected} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
        <option value="">Select your table (or enter manually at checkout)</option>
        {(data || []).map((t) => {
          const tn = t.tableNumber || t.table_number
          return (
            <option key={t.id} value={tn}>{`Table ${tn} ${t.status ? `- ${t.status}` : ''}`}</option>
          )
        })}
        <option value="">Not using table / Takeaway</option>
      </select>
      <div className="mt-2">
        <label className="block text-xs text-gray-500 mb-1">Or enter table number</label>
        <input
          type="text"
          value={selected}
          onChange={(e) => {
            const v = e.target.value
            setSelected(v)
            setTableNumber(v)
          }}
          placeholder="e.g. 12"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>
    </div>
  )
}

export default TableSelector
