import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { PlusIcon } from '@heroicons/react/24/outline'
import TableList from './TableList'
import TableModal from './TableModal'
import ReservationsList from './ReservationsList'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import Tabs from '../../../common/Tabs'
import { getTables } from '../../../services/tableService'
import { useAuthStore } from '../../../store/authStore'

const TableManagement = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState(null)

  const { user } = useAuthStore()

  const { data: tables, isLoading, refetch } = useQuery(
    ['tables', user?.restaurant_id],
    () => getTables(user?.restaurant_id),
    { enabled: !!user?.restaurant_id }
  )

  if (isLoading) return <Loading />

  const tabs = [
    { label: 'Tables', content: renderTablesContent() },
    { label: 'Reservations', content: <ReservationsList /> },
  ]

  function renderTablesContent() {
    return (
      <>
        <div className="mb-6 rounded-none border border-slate-200  p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Restaurant tables</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Table Management</h1>
              <p className="text-sm leading-6 text-slate-500 sm:text-base">Manage seating, floor layout, and reservations with the analytics palette.</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button onClick={() => setShowModal(true)} icon={PlusIcon} className="w-full sm:w-auto">
                Add Table
              </Button>
            </div>
          </div>
        </div>

        {/* Tables Display */}
          <TableList tables={tables || []} onEdit={setEditingTable} onRefresh={refetch} />
      </>
    )
  }

  return (
    <div className="relative overflow-x-hidden bg-slate-50 p-4 sm:p-6 font-['Manrope',system-ui,sans-serif] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative space-y-6">
        <Tabs tabs={tabs} />
      
        <TableModal
          isOpen={showModal || !!editingTable}
          onClose={() => {
            setShowModal(false)
            setEditingTable(null)
          }}
          table={editingTable}
          onSuccess={() => {
            refetch()
            setShowModal(false)
            setEditingTable(null)
          }}
        />
      </div>
    </div>
  )
}

export default TableManagement