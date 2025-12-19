// components/ImageUploadModal.tsx
'use client'

import * as React from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Props {
  isOpen: boolean
  onClose: () => void
  uploadImages: (files: File[]) => Promise<string[]>
  onUploadSuccess: (uploadedUrls: string[]) => void
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  uploadImages,
  onUploadSuccess,
}: Props) {
  const [files, setFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
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
    try {
      const urls = await uploadImages(files)
      onUploadSuccess(urls)
      // Modal will close → cleanup happens in useEffect
      onClose()
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const onBrowse = () => inputRef.current?.click()

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload  Images</DialogTitle>
          <DialogDescription>Select images to  Upload.</DialogDescription>
        </DialogHeader>

        {files.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>{files.length}</strong> image(s) selected
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="bg-black text-white"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : `Upload ${files.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}