import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Input from '../../../common/Input'
import Textarea from '../../../common/Textarea'
import Button from '../../../common/Button'
import FileUpload from '../../../common/FileUpload'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().max(200, 'Description cannot exceed 200 characters'),
})

const CategoryForm = ({ category, onSubmit, onCancel, isLoading }) => {
  const isEditing = !!category
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(category?.icon || category?.icon_url || null)
  const [isUploading, setIsUploading] = useState(false)
  const [iconUrlInput, setIconUrlInput] = useState(category?.icon || category?.icon_url || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
      })
      setIconPreview(category.icon || category.icon_url || '')
      setIconUrlInput(category.icon || category.icon_url || '')
    }
  }, [category, reset])

  const handleIconUpload = async (files) => {
    if (!files) return // Handle case where FileUpload passes null (e.g., when clearing files)
    if (files[0]) {
      setIsUploading(true)
      try {
        const result = await uploadFile(files[0], 'category-icons')
        // result.url will be Cloudinary URL or local uploads path
        setIconFile(result.url)
        // show a local preview immediately while the uploaded URL is stored for submit
        setIconPreview(URL.createObjectURL(files[0]))
        setIconUrlInput('')
      } catch (error) {
        toast.error('Failed to upload icon')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleIconUrlChange = (e) => {
    const url = e.target.value
    setIconUrlInput(url)
    setIconPreview(url || null)
    setIconFile(url || null)
  }

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      icon_url: iconFile || iconPreview,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 rounded-none bg-white">
      <Input
        label="Category Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="e.g., Appetizers, Main Courses, Desserts"
        required
      />

      <Textarea
        label="Description (Optional)"
        {...register('description')}
        error={errors.description?.message}
        rows={3}
        placeholder="Brief description of this category"
      />

      <FileUpload
        label="Category Icon"
        onFileSelect={handleIconUpload}
        accept={{ 'image/*': ['.jpeg', '.png', '.jpg', '.svg'] }}
      />
      <Input
        label="Or Icon URL"
        placeholder="https://example.com/icon.png"
        value={iconUrlInput}
        onChange={handleIconUrlChange}
      />
      
      {iconPreview && (
        <div className="mt-2">
          <p className="mb-1 text-sm text-slate-500">Preview:</p>
          <img src={iconPreview} alt="Icon preview" className="h-16 w-16 rounded-none border border-slate-200 object-cover" />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="rounded-none">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading || isUploading} className="rounded-none bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:from-orange-600 hover:to-blue-600">
          {isEditing ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}

export default CategoryForm