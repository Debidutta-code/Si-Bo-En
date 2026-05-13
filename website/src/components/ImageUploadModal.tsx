import * as React from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Badge } from '@/src/components/ui/badge'
import toast from 'react-hot-toast'
import createAxiosInstance from './axiosInstance'

interface Props {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: (uploadedUrls: string[]) => void
}

const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME ;
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET ;
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset!)
  formData.append('folder', 'SwiftRooms-Images')
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.secure_url
}
const uploadToS3 = async (file: File): Promise<string> => {
  const axiosinstance = createAxiosInstance();

  const res = await axiosinstance.post("/upload/generate-url", {
    fileType: file.type,
  });

  const { uploadUrl, fileUrl } = res.data.data;

  await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  return fileUrl;
};
export default function ImageUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: Props) {
  const [files, setFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<string>('')
  const [error, setError] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      // Clean up object URLs
      previews.forEach(url => URL.revokeObjectURL(url))
      setFiles([])
      setPreviews([])
      setError('')
      setUploadProgress('')
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [isOpen])

  const addFiles = (incoming: FileList | File[]) => {
    const selected = Array.from(incoming)
    if (!selected.length) return

    const validImages = selected.filter(file => file.type.startsWith('image/'))
    if (validImages.length === 0) {
      setError('Please select valid image files.')
      return
    }

    // Avoid duplicates by name+size
    const existingKeys = new Set(files.map(f => `${f.name}-${f.size}`))
    const newFiles = validImages.filter(file => {
      const key = `${file.name}-${file.size}`
      return !existingKeys.has(key)
    })

    if (newFiles.length === 0) {
      setError('All selected images are already added.')
      return
    }

    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setFiles(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newPreviews])
    setError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (files) addFiles(files)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image.")
      return
    }

    setIsUploading(true)
    setError('')
    const uploadedUrls: string[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)
        let url ;
        if(process.env.NEXT_PUBLIC_NODE_ENV==="production"){
          url=await uploadToS3(files[i])
        }else{
          url=await uploadToCloudinary(files[i])
        }
        uploadedUrls.push(url)
      }
      
      // toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`)
      onUploadSuccess(uploadedUrls)
      onClose()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err?.message || 'Upload failed. Please try again.')
      toast.error('Failed to upload images')
    } finally {
      setIsUploading(false)
      setUploadProgress('')
    }
  }

  const onBrowse = () => inputRef.current?.click()

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>Select images to Upload.</DialogDescription>
        </DialogHeader>

        {files.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>{files.length}</strong> image(s) selected
          </div>
        )}

        {uploadProgress && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {uploadProgress}
          </div>
        )}

        {/* Dropzone */}
        <div
          onClick={onBrowse}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer',
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto mb-2" />
          <div>Drag & drop or click to browse</div>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Preview</h4>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-full h-16 object-cover rounded" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(i) }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center p-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <Badge variant="destructive">{error}</Badge>}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="bg-black text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}