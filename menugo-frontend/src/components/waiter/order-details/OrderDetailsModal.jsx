
import Modal from '../../common/Modal'
import SpecialInstructions from './SpecialInstructions'
import OrderActions from './OrderActions'
import OrderStatusBadge from '../orders/OrderStatusBadge'
import { formatCurrency } from '../../../utils/formatters'

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
    <Modal isOpen={true} onClose={onClose} title={`Order Details - #${titleNumber || ''}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Customer</p>
            <p className="font-medium text-slate-900">{normalized.customer.name}</p>
            <p className="mt-3 text-sm text-slate-500">Table Number</p>
            <p className="font-medium text-slate-900">{normalized.table.number || 'N/A'}</p>
            {normalized.table.section && (
              <>
                <p className="mt-3 text-sm text-slate-500">Section</p>
                <p className="font-medium text-slate-900">{normalized.table.section}</p>
              </>
            )}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Order Status</p>
            <div className="mt-1 sm:flex sm:justify-end">
              <OrderStatusBadge status={normalized.status} size="md" />
            </div>
            <p className="mt-3 text-sm text-slate-500">Total Amount</p>
            <p className="text-2xl font-extrabold text-orange-600">{formatCurrency(normalized.totalAmount)}</p>
          </div>
        </div>

        <div className="bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Order Items</h4>
          <div className="space-y-2">
            {normalized.items.map((item, index) => {
              const lineTotal = item.unitPrice * item.quantity
              return (
                <div key={index} className="flex items-start gap-3 border border-slate-100 p-2">
                  <div className="shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-10 w-10 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-xs text-slate-400">No Image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="truncate">
                        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                        {item.options.length > 0 && <p className="mt-1 truncate text-[11px] text-slate-500">{item.options.map((option) => `${option.name}: ${option.choice ?? option.value ?? ''}`).join(', ')}</p>}
                        {item.modifiers.length > 0 && <p className="mt-1 text-[11px] text-slate-500">+ {item.modifiers.map((modifier) => modifier.name).join(', ')}</p>}
                      </div>
                      <div className="ml-4 shrink-0 text-right">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(lineTotal)}</p>
                        <p className="text-[11px] text-slate-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {normalized.specialInstructions && (
          <SpecialInstructions instructions={normalized.specialInstructions} />
        )}

        <div className="border-t border-slate-100 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">Subtotal</span>
            <span className="text-slate-900">{formatCurrency(normalized.subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-700">Tax</span>
            <span className="text-slate-900">{formatCurrency(normalized.taxAmount)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">{formatCurrency(normalized.totalAmount)}</span>
          </div>
        </div>

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