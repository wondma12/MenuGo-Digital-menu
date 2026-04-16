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

  const { data: plans, isLoading } = useQuery('subscriptionPlans', getSubscriptionPlans)

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Manage pricing plans and features</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
        ))}
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