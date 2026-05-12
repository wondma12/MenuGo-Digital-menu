import React from 'react'
import Modal from '../../common/Modal'
import OrderItemsList from './OrderItemsList'
import OrderSummary from './OrderSummary'
import CustomerInfo from './CustomerInfo'
import TableInfo from './TableInfo'
import SpecialInstructions from './SpecialInstructions'
import OrderActions from './OrderActions'

const OrderDetailsModal = ({ order, displayNumber, onClose, onRefresh }) => {
  if (!order) return null

  // Normalize order shape to be resilient to backend variations
  const normalized = (() => {
    const o = order || {}

    const id = o.id ?? o._id ?? o.orderId ?? o.order_id ?? null
    const orderNumber = o.orderNumber ?? o.order_number ?? o.number ?? id ?? ''

    const customer = {
      name: o.customer?.name ?? o.customerName ?? o.customer_name ?? o.customer?.fullName ?? 'Guest',
      email: o.customer?.email ?? o.customerEmail ?? o.customer_email,
      phone: o.customer?.phone ?? o.customerPhone ?? o.customer_phone,
    }

    const table = {
      number: o.tableNumber ?? o.table_number ?? o.table?.number ?? o.table?.table_number ?? o.tableName ?? null,
      section: o.tableSection ?? o.table_section ?? o.table?.section ?? null,
      capacity: o.table?.capacity ?? null,
    }

    const items = (o.items || []).map(item => {
      const unitPriceRaw = item.unitPrice ?? item.price ?? item.unit_price ?? item.amount ?? 0
      const unitPrice = Number(unitPriceRaw) || 0
      const quantity = Number(item.quantity ?? item.qty ?? 1) || 0
      const name = item.name ?? item.title ?? item.menuItemName ?? 'Item'
      const category = item.category?.name ?? item.categoryName ?? item.category ?? item.menu_category ?? null
      const image = item.imageUrl ?? item.image ?? item.image_url ?? (item.images && item.images[0]) ?? null
      const options = item.options ?? item.choices ?? []
      const modifiers = item.modifiers ?? item.addons ?? []
      return { ...item, unitPrice, quantity, name, category, image, options, modifiers }
    })

    const computedSubtotal = items.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.quantity || 0)), 0)
    const subtotal = Number(o.subtotal ?? o.subTotal ?? o.sub_total ?? computedSubtotal) || computedSubtotal
    const taxAmount = Number(o.taxAmount ?? o.tax ?? o.tax_amount ?? 0) || 0
    const serviceCharge = Number(o.serviceCharge ?? o.service_charge ?? 0) || 0
    const discountAmount = Number(o.discountAmount ?? o.discount_amount ?? o.discount ?? 0) || 0
    const totalAmount = Number(o.totalAmount ?? o.total ?? o.total_amount ?? (subtotal + taxAmount + serviceCharge - discountAmount)) || (subtotal + taxAmount + serviceCharge - discountAmount)

    return {
      id,
      orderNumber,
      customer,
      table,
      items,
      subtotal,
      taxAmount,
      serviceCharge,
      discountAmount,
      totalAmount,
      status: o.status,
      specialInstructions: o.specialInstructions ?? o.instructions ?? o.note ?? null,
    }
  })()

  const titleNumber = displayNumber ?? normalized.orderNumber

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details - #${titleNumber || ''}`} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomerInfo customer={normalized.customer} />
          <TableInfo table={normalized.table} />
        </div>

        <OrderItemsList items={normalized.items || []} />

        {normalized.specialInstructions && (
          <SpecialInstructions instructions={normalized.specialInstructions} />
        )}

        <OrderSummary order={normalized} />

        <OrderActions
          orderId={normalized.id}
          currentStatus={normalized.status}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      </div>
    </Modal>
  )
}

export default OrderDetailsModal