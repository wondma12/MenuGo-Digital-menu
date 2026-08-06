
import { formatCurrency } from '../../../utils/formatters'

const OrderItemsList = ({ items = [], order = {} }) => {
  return (
    <div className="rounded-none bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h4 className="mb-2 text-sm font-semibold text-slate-900">Order Items</h4>

      <div className="space-y-2">
        {items.map((item, index) => {
          const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
          return (
            <div key={index} className="flex items-start gap-3 rounded-none border border-slate-100 p-2">
              {/* Image / placeholder */}
              <div className="flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-none object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-slate-100 text-xs text-slate-400">No Image</div>
                )}
              </div>

              {/* Name, options, modifiers */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    {item.options && item.options.length > 0 && (
                      <p className="mt-1 truncate text-[11px] text-slate-500">{item.options.map(opt => `${opt.name}: ${opt.choice}`).join(', ')}</p>
                    )}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="mt-1 text-[11px] text-slate-500">+ {item.modifiers.map(m => m.name).join(', ')}</p>
                    )}
                    {item.specialInstructions && (
                      <p className="mt-1 text-[11px] text-orange-700">Note: {item.specialInstructions}</p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(lineTotal)}</p>
                    <p className="text-[11px] text-slate-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-700">Subtotal</span>
          <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span className="text-slate-700">Tax</span>
          <span className="text-slate-900">{formatCurrency(order.taxAmount)}</span>
        </div>

        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold">
          <span className="text-slate-900">Total</span>
          <span className="text-slate-900">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderItemsList