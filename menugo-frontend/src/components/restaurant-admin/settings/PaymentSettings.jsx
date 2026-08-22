import {useState} from 'react'
import { useMutation, useQueryClient } from 'react-query'
import Switch from '../../../common/Switch'
import Button from '../../../common/Button'
import { updatePaymentSettings } from '../../../services/restaurantService'
import toast from 'react-hot-toast'

const PaymentSettings = ({ settings }) => {
  const [formData, setFormData] = useState({
    allowCashPayment: settings?.allowCashPayment || true,
    allowCardPayment: settings?.allowCardPayment || true,
    allowOnlinePayment: settings?.allowOnlinePayment || true,
    stripeEnabled: settings?.stripeEnabled || false,
    stripePublicKey: settings?.stripePublicKey || '',
    stripeSecretKey: settings?.stripeSecretKey || '',
  })

  const queryClient = useQueryClient()
  const mutation = useMutation(updatePaymentSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries('restaurantSettings')
      toast.success('Payment settings updated')
    },
    onError: () => toast.error('Failed to update settings'),
  })

  const handleSubmit = () => {
    mutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <Switch
          label="Cash Payment"
          checked={formData.allowCashPayment}
          onChange={(checked) => setFormData({ ...formData, allowCashPayment: checked })}
        />
        <Switch
          label="Card Payment (POS)"
          checked={formData.allowCardPayment}
          onChange={(checked) => setFormData({ ...formData, allowCardPayment: checked })}
        />
        <Switch
          label="Online Payment"
          checked={formData.allowOnlinePayment}
          onChange={(checked) => setFormData({ ...formData, allowOnlinePayment: checked })}
        />

        {formData.allowOnlinePayment && (
          <div className="ml-6 pl-4 border-l-2 border-slate-100 space-y-4">
            <Switch
              label="Stripe Integration"
              checked={formData.stripeEnabled}
              onChange={(checked) => setFormData({ ...formData, stripeEnabled: checked })}
            />
            {formData.stripeEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stripe Public Key</label>
                  <input
                    type="text"
                    value={formData.stripePublicKey}
                    onChange={(e) => setFormData({ ...formData, stripePublicKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="pk_test_..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stripe Secret Key</label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={formData.stripeSecretKey}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={mutation.isLoading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">Save Settings</Button>
      </div>
    </div>
  )
}

export default PaymentSettings