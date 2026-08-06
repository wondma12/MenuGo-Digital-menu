

const fmt = (n) => {
  const v = Number(n)
  if (isNaN(v)) return '0.00'
  return v.toFixed(2)
}

const OrderSummary = ({ order }) => {
  const items = order.items || []
  const computedSubtotal = items.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.quantity || 0)), 0)
  const subtotal = Number(order.subtotal ?? computedSubtotal) || computedSubtotal
  const taxAmount = Number(order.taxAmount ?? order.tax ?? 0) || 0
  const serviceCharge = Number(order.serviceCharge ?? 0) || 0
  const discountAmount = Number(order.discountAmount ?? 0) || 0
  const totalAmount = Number(order.totalAmount ?? (subtotal + taxAmount + serviceCharge - discountAmount)) || (subtotal + taxAmount + serviceCharge - discountAmount)

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Order Summary</h4>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">Totals</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium text-slate-900">${fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tax</span>
          <span className="font-medium text-slate-900">${fmt(taxAmount)}</span>
        </div>
        {serviceCharge > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Service Charge</span>
            <span className="font-medium text-slate-900">${fmt(serviceCharge)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="text-red-600">-${fmt(discountAmount)}</span>
          </div>
        )}
        <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-2.5 text-sm font-bold sm:text-base">
          <span className="text-slate-900">Total</span>
          <span className="text-primary-600">${fmt(totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary