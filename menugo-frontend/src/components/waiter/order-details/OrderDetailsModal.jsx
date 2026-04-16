import React from 'react'
import Modal from '../../common/Modal'
import OrderItemsList from './OrderItemsList'
import OrderSummary from './OrderSummary'
import CustomerInfo from './CustomerInfo'
import TableInfo from './TableInfo'
import SpecialInstructions from './SpecialInstructions'
import OrderActions from './OrderActions'

const OrderDetailsModal = ({ order, onClose, onRefresh }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details - #${order.orderNumber}`} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerInfo customer={order.customer} />
          <TableInfo table={{ number: order.tableNumber, section: order.tableSection }} />
        </div>

        <OrderItemsList items={order.items || []} />

        {order.specialInstructions && (
          <SpecialInstructions instructions={order.specialInstructions} />
        )}

        <OrderSummary order={order} />

        <OrderActions
          orderId={order.id}
          currentStatus={order.status}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      </div>
    </Modal>
  )
}

export default OrderDetailsModal