

const CartSummary = ({ subtotal, tax, total, discount = 0, taxRate = null }) => {
  const taxLabel = Number.isFinite(Number(taxRate)) ? `Tax (${String(Number(taxRate).toFixed(2)).replace(/\.0+$/, '').replace(/\.?0+$/, '')}%)` : 'Tax'

  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
        <span className="text-slate-500">Subtotal</span>
        <span className="text-slate-900">Br {subtotal.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Discount</span>
          <span className="text-rose-600">-Br {discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
        <span className="text-slate-500">{taxLabel}</span>
        <span className="text-slate-900">Br {tax.toFixed(2)}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between text-lg font-black pt-2 border-t border-slate-200">
        <span className="text-slate-900">Total</span>
        <span className="text-slate-900">Br {total.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default CartSummary