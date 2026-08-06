import {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery } from 'react-query'
import { useAuthStore } from '../../../store/authStore'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Select from '../../../common/Select'
import Switch from '../../../common/Switch'
import Button from '../../../common/Button'
import ImageWithPlaceholder from '../../common/ImageWithPlaceholder.jsx'
import FileUpload from '../../../common/FileUpload'
import { createMenuItem, updateMenuItem } from '../../../services/menuService'
import { getCategories } from '../../../services/categoryService'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Item name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string(),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  categoryId: yup.string().required('Category is required'),
  preparationTime: yup.number().positive().integer(),
  calories: yup.number().positive().integer(),
  spiceLevel: yup.number().min(0).max(5),
})

const MenuItemForm = ({ item, onSuccess, onCancel }) => {
  const isEditing = !!item
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || null)
  const [imageUrlInput, setImageUrlInput] = useState(item?.imageUrl || '')
  const [isUploading, setIsUploading] = useState(false)

  const { user } = useAuthStore()

  const { data: categories } = useQuery(
    ['categories', user?.restaurant_id],
    () => getCategories(user?.restaurant_id),
    { enabled: !!user?.restaurant_id }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      categoryId: item?.categoryId || '',
      preparationTime: item?.preparationTime || '',
      calories: item?.calories || '',
      spiceLevel: item?.spiceLevel || 0,
      isAvailable: item?.isAvailable ?? true,
      isVegetarian: item?.isVegetarian || false,
      isVegan: item?.isVegan || false,
      isGlutenFree: item?.isGlutenFree || false,
    },
  })


  const createMutation = useMutation(
    (formData) => createMenuItem(user?.restaurant_id, formData),
    {
      onSuccess: () => {
        toast.success('Menu item created successfully')
        onSuccess()
      },
      onError: () => toast.error('Failed to create menu item'),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => updateMenuItem(id, data),
    {
      onSuccess: () => {
        toast.success('Menu item updated successfully')
        onSuccess()
      },
      onError: () => toast.error('Failed to update menu item'),
    }
  )

  const handleImageUpload = async (files) => {
    // FileUpload may pass a single File, an array of Files, or null.
    if (!files) return

    const file = Array.isArray(files) ? files[0] : files
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadFile(file, 'menu-items')
      setImageFile(result.url)
      // Show a local preview while upload succeeded (server url used for payload)
      try {
        setImagePreview(URL.createObjectURL(file))
      } catch (e) {
        setImagePreview(result.url || null)
      }
      setImageUrlInput('')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setImageUrlInput(url)
    setImagePreview(url || null)
    // Use the URL directly as the image URL payload
    setImageFile(url || null)
  }

  const onSubmit = async (data) => {
    // Build a safe payload only with primitive values to avoid circular JSON errors
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category_id: data.categoryId,
      preparation_time: data.preparationTime ? Number(data.preparationTime) : 0,
      calories: data.calories ? Number(data.calories) : 0,
      spice_level: data.spiceLevel ? Number(data.spiceLevel) : 0,
      is_available: data.isAvailable ?? true,
      is_vegetarian: data.isVegetarian ?? false,
      is_vegan: data.isVegan ?? false,
      is_gluten_free: data.isGlutenFree ?? false,
      image_url: imageFile || (typeof imagePreview === 'string' ? imagePreview : null),
    }

    if (isEditing) {
      updateMutation.mutate({ id: item.id, data: payload })
    } else {
      if (!user?.restaurant_id) {
        toast.error('No restaurant selected')
        return
      }
      createMutation.mutate(payload)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Item Name" {...register('name')} error={errors.name?.message} required />
      
      <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={3} />
      
      <div className="grid grid-cols-2 gap-4">
        <Input label="Price (ETB)" type="number" step="0.01" {...register('price')} error={errors.price?.message} required />
        <Select
          label="Category"
          {...register('categoryId')}
          error={errors.categoryId?.message}
          options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
          required
        />
        <Input label="Preparation Time (min)" type="number" {...register('preparationTime')} error={errors.preparationTime?.message} />
        <Input label="Calories" type="number" {...register('calories')} error={errors.calories?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level (0-5)</label>
        <input type="range" min="0" max="5" step="1" {...register('spiceLevel')} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <span key={level}>{'🔥'.repeat(level) || 'None'}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FileUpload
            label="Upload Image"
            onFileSelect={handleImageUpload}
            accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }}
          />
        </div>
        <div>
          <Input
            label="Or Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrlInput}
            onChange={handleImageUrlChange}
          />
          <p className="text-xs text-gray-400 mt-2">Paste an image URL to use instead of uploading a file.</p>
        </div>
      </div>
          {imagePreview && (
            <div className="w-36 h-36">
              <ImageWithPlaceholder src={imagePreview} alt="Preview" className="rounded-lg" />
            </div>
          )}

      <div className="grid grid-cols-2 gap-4">
        <Switch label="Available" checked={watch('isAvailable')} onChange={(checked) => setValue('isAvailable', checked)} />
        <Switch label="Vegetarian" checked={watch('isVegetarian')} onChange={(checked) => setValue('isVegetarian', checked)} />
        <Switch label="Vegan" checked={watch('isVegan')} onChange={(checked) => setValue('isVegan', checked)} />
        <Switch label="Gluten Free" checked={watch('isGlutenFree')} onChange={(checked) => setValue('isGlutenFree', checked)} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading || isUploading} className="rounded-none bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-orange-600">
          {isEditing ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}

export default MenuItemForm