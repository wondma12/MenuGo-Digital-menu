import {useState} from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import Input from '../../common/Input'
import Button from '../../common/Button'
import FileUpload from '../../common/FileUpload'
import { updateWaiterProfile } from '../../../services/waiterService'
import { uploadFile } from '../../../services/uploadService'
import toast from 'react-hot-toast'

const ProfileForm = ({ profile }) => {
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || ''
    }
  })

  const mutation = useMutation(updateWaiterProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('waiterProfile')
      toast.success('Profile updated successfully')
    }
  })

  const handleAvatarUpload = async (files) => {
    // FileUpload may pass a single File, an array of Files, or null
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadFile(file, 'avatars')
      // `uploadFile` should return an object with `url` pointing to stored file
      setAvatarFile(result?.url || null)
      // preview using local file when available
      try {
        setAvatarPreview(URL.createObjectURL(file))
      } catch (e) {
        // fallback to returned URL
        if (result?.url) setAvatarPreview(result.url)
      }
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
    return
  }

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      avatar: avatarFile || avatarPreview
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FileUpload
        label="Profile Picture"
        onFileSelect={handleAvatarUpload}
        accept={{ 'image/*': ['.jpeg', '.png', '.jpg'] }}
      />
      {avatarPreview && (
        <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
      )}
      <Input label="Full Name" {...register('name')} error={errors.name?.message} required />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} required />
      <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      <div className="flex justify-end">
        <Button type="submit" isLoading={mutation.isLoading || isUploading}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

export default ProfileForm