
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Select from '../../../common/Select'
import DatePicker from '../../../common/DatePicker'
import TimePicker from '../../../common/TimePicker'
import Button from '../../../common/Button'
import { createReservation } from '../../../services/reservationService'
import { useQuery } from 'react-query'
import { getTables } from '../../../services/tableService'
import toast from 'react-hot-toast'

const schema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  customerPhone: yup.string().required('Phone number is required'),
  customerEmail: yup.string().email('Invalid email'),
  tableId: yup.string().required('Please select a table'),
  partySize: yup.number().positive().integer().min(1).required('Party size is required'),
  reservationDate: yup.date().required('Date is required').min(new Date(), 'Date cannot be in the past'),
  reservationTime: yup.string().required('Time is required'),
  specialRequests: yup.string(),
})

const ReservationForm = ({ onSuccess, onCancel }) => {
  const queryClient = useQueryClient()
  const { data: tables } = useQuery('tables', getTables)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      reservationDate: new Date(),
      partySize: 2,
    },
  })

  const createMutation = useMutation(createReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries('reservations')
      toast.success('Reservation created successfully')
      onSuccess()
    },
    onError: () => toast.error('Failed to create reservation'),
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }

  const tableOptions = tables?.map(t => ({ value: t.id, label: `Table ${t.tableNumber} (${t.capacity} seats)` })) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Customer Name" {...register('customerName')} error={errors.customerName?.message} required />
      <Input label="Phone Number" {...register('customerPhone')} error={errors.customerPhone?.message} required />
      <Input label="Email (Optional)" type="email" {...register('customerEmail')} error={errors.customerEmail?.message} />
      
      <Select label="Select Table" {...register('tableId')} error={errors.tableId?.message} options={tableOptions} required />
      
      <Input label="Party Size" type="number" {...register('partySize')} error={errors.partySize?.message} required />
      
      <DatePicker
        label="Reservation Date"
        selected={watch('reservationDate')}
        onChange={(date) => setValue('reservationDate', date)}
        error={errors.reservationDate?.message}
      />
      
      <TimePicker
        label="Reservation Time"
        selected={watch('reservationTime')}
        onChange={(time) => setValue('reservationTime', time)}
        error={errors.reservationTime?.message}
      />
      
      <Input label="Special Requests (Optional)" {...register('specialRequests')} error={errors.specialRequests?.message} />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={createMutation.isLoading}>Create Reservation</Button>
      </div>
    </form>
  )
}

export default ReservationForm