

const OrderItemsList = ({ items }) => {
  return (
    <div>
      <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Order Items</h4>
      <div className="space-y-2">
        {items.map((item, index) => {
          const qty = Number(item.quantity ?? item.qty ?? 1) || 0
          const price = Number(item.unitPrice ?? item.price ?? 0) || 0
          const lineTotal = price * qty
          return (
            <div key={index} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-2.5 sm:items-center">
              <div className="flex flex-1 items-start gap-2.5 sm:items-center sm:gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400 sm:h-12 sm:w-12">No Img</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{qty}x</span>
                    <span className="truncate text-sm text-slate-700">{item.name}</span>
                  </div>
                  {item.category && <div className="mt-0.5 text-[11px] text-slate-500">{item.category}</div>}
                  {item.options && item.options.length > 0 && (
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {item.options.map(opt => `${opt.name}: ${opt.choice ?? opt.value ?? ''}`).join(', ')}
                    </div>
                  )}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="mt-0.5 text-[11px] text-slate-500">+ {item.modifiers.map(m => m.name).join(', ')}</div>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-slate-900">${lineTotal.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500">${price.toFixed(2)} each</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderItemsList