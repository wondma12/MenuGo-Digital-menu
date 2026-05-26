import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import { acknowledgeCall, resolveCall } from '../../../services/callService'
import toast from 'react-hot-toast'
import { Bell, CreditCard, HelpCircle, Coffee, MessageSquare, Clock3 } from 'lucide-react'

const CallDetails = ({ isOpen, onClose, call, onRefresh }) => {
  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation(acknowledgeCall, {
    onSuccess: () => {
      toast.success('Call acknowledged')
      queryClient.invalidateQueries('waiterCalls')
      onRefresh()
      onClose()
    }
  })

  const resolveMutation = useMutation(resolveCall, {
    onSuccess: () => {
      toast.success('Call resolved')
      queryClient.invalidateQueries('waiterCalls')
      onRefresh()
      onClose()
    }
  })

  const getCallTypeIcon = (type) => {
    const icons = {
      service: <Bell className="w-12 h-12" />,
      bill: <CreditCard className="w-12 h-12" />,
      help: <HelpCircle className="w-12 h-12" />,
      food_issue: <Coffee className="w-12 h-12" />,
      other: <MessageSquare className="w-12 h-12" />,
    }
    return icons[type] || <Bell className="w-12 h-12" />
  }

  const getCallTypeLabel = (type) => {
    const labels = {
      service: 'Service Request',
      bill: 'Bill Request',
      help: 'Help / Assistance',
      food_issue: 'Food Issue',
      other: 'Other Request'
    }
    return labels[type] || 'Call Request'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Call Details" size="md">
      <div className="space-y-4">
        <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(249,115,22,0.12),rgba(59,130,246,0.06))] p-4 text-center ring-1 ring-orange-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
            {getCallTypeIcon(call.callType)}
          </div>
          <h3 className="mt-3 text-lg font-black tracking-tight text-slate-900">{getCallTypeLabel(call.callType)}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">Table {call.tableNumber} • {call.section || 'Main Hall'}</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="h-4 w-4" /> Time</span>
            <span className="font-medium text-slate-700">{new Date(call.createdAt).toLocaleTimeString()}</span>
          </div>
          {call.customerName && (
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Customer</span>
              <span className="font-medium text-slate-700">{call.customerName}</span>
            </div>
          )}
          {call.notes && (
            <div className="pt-3">
              <span className="text-sm font-semibold text-slate-500">Notes</span>
              <p className="mt-1 text-sm leading-6 text-slate-700">{call.notes}</p>
            </div>
          )}
        </div>

        {call.status === 'pending' && (
          <div className="flex gap-3">
            <Button
              onClick={() => acknowledgeMutation.mutate(call.id)}
              isLoading={acknowledgeMutation.isLoading}
              className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white"
              fullWidth
              size="sm"
            >
              Acknowledge Call
            </Button>
          </div>
        )}

        {call.status === 'acknowledged' && (
          <div className="flex gap-3">
            <Button
              onClick={() => resolveMutation.mutate(call.id)}
              isLoading={resolveMutation.isLoading}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white"
              fullWidth
              size="sm"
            >
              Mark as Resolved
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="secondary" onClick={onClose} size="sm">Close</Button>
        </div>
      </div>
    </Modal>
  )
}

export default CallDetails