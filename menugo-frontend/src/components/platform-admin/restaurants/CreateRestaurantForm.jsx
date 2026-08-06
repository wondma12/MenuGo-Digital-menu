// src/components/platform-admin/restaurants/CreateRestaurantForm.jsx
import {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { createRestaurant } from '../../../services/restaurantService';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Alert from '../../common/Alert';

const schema = yup.object({
  name: yup.string().required('Restaurant name is required').min(3, 'Name must be at least 3 characters'),
  owner_email: yup.string().email('Invalid email').required('Owner email is required'),
  owner_name: yup.string().required('Owner name is required'),
  owner_phone: yup.string().optional(),
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email').optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  country: yup.string().optional(),
  cuisine_type: yup.string().optional(),
  description: yup.string().optional(),
});

const CreateRestaurantForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      country: 'USA',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createRestaurant(data);
      toast.success(result?.message || 'Restaurant created successfully!');
      
      // Redirect to restaurant list
      setTimeout(() => {
        navigate('/platform/restaurants');
      }, 2000);
    } catch (err) {
      console.error('Create restaurant error:', err);
      setError(err.response?.data?.message || 'Failed to create restaurant');
      toast.error(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Restaurant</h1>
        <p className="text-gray-500 mt-1">Add a new restaurant to the platform</p>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" onClose={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Restaurant Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Restaurant Name *"
              {...register('name')}
              error={errors.name?.message}
              required
            />
            <Input
              label="Cuisine Type"
              {...register('cuisine_type')}
              error={errors.cuisine_type?.message}
              placeholder="e.g., Italian, Chinese, Fusion"
            />
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              type="tel"
            />
            <Input
              label="Email"
              {...register('email')}
              error={errors.email?.message}
              type="email"
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                {...register('address')}
                error={errors.address?.message}
              />
            </div>
            <Input
              label="City"
              {...register('city')}
              error={errors.city?.message}
            />
            <Input
              label="Country"
              {...register('country')}
              error={errors.country?.message}
            />
            <div className="md:col-span-2">
              <textarea
                {...register('description')}
                placeholder="Restaurant description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              The owner will receive an email with login credentials to access their restaurant dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner Email *"
              {...register('owner_email')}
              error={errors.owner_email?.message}
              type="email"
              required
            />
            <Input
              label="Owner Name *"
              {...register('owner_name')}
              error={errors.owner_name?.message}
              required
            />
            <Input
              label="Owner Phone"
              {...register('owner_phone')}
              error={errors.owner_phone?.message}
              type="tel"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" isLoading={isLoading}>
            Create Restaurant
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/platform/restaurants')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRestaurantForm;