import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import PlanCard from './PlanCard'
import PlanForm from './PlanForm'
import Modal from '../../../common/Modal'
import Button from '../../../common/Button'
import Loading from '../../../common/Loading'
import { getSubscriptionPlans, createPlan, updatePlan, deletePlan } from '../../../services/subscriptionService'
import toast from 'react-hot-toast'

const SubscriptionPlans = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const queryClient = useQueryClient()

  const { data: plans, isLoading, error } = useQuery('subscriptionPlans', getSubscriptionPlans)

  const createMutation = useMutation(createPlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptionPlans')
      setShowModal(false)
      toast.success('Plan created successfully')
    },
  })

  const updateMutation = useMutation(updatePlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptionPlans')
      setShowModal(false)
      setEditingPlan(null)
      toast.success('Plan updated successfully')
    },
  })

  const deleteMutation = useMutation(deletePlan, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptionPlans')
      toast.success('Plan deleted successfully')
    },
  })

  const handleSubmit = (data) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-600">Unable to load subscription plans. Please refresh.</div>

  return (
    <div className="relative space-y-6 overflow-visible bg-white p-4 sm:px-6 lg:px-8 font-['Manrope',system-ui,sans-serif] text-slate-900 sm:p-6 lg:p-8">
      {/* <div className="relative overflow-hidden rounded-none border border-orange-100 bg-white p-6 shadow-sm sm:p-8"> */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,146,60,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-600">Subscriptions</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Subscription Plans</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">Manage pricing plans and features</p>
          </div>
          <Button onClick={() => setShowModal(true)} icon={PlusIcon} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600">
            Add Plan
          </Button>
        </div>
      {/* </div> */}

      <div className="grid grid-cols-1 gap-6 items-stretch md:grid-cols-2 xl:grid-cols-3">
        {plans && plans.length > 0 ? (
          plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <PlanCard
                plan={plan}
                onEdit={() => {
                  setEditingPlan(plan)
                  setShowModal(true)
                }}
                onDelete={() => {
                  if (confirm('Are you sure you want to delete this plan?')) {
                    deleteMutation.mutate(plan.id)
                  }
                }}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-none border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <p className="text-slate-600">No subscription plans yet</p>
            <p className="mt-1 text-sm text-slate-500">Click "Add Plan" to create your first subscription plan</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingPlan(null)
        }}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        size="lg"
      >
        <PlanForm
          initialData={editingPlan}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setEditingPlan(null)
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      </Modal>
    </div>
  )
}

export default SubscriptionPlans