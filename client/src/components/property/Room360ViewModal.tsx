'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageUploadModal from './ImageUploadModal'
import { add360ToRoom } from './api/create/room'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface Props {
    propertyId: string  
    isOpen: boolean
    onClose: () => void
    roomId: string
    roomName: string
    currentView360Link?: string
    onSuccess: () => void
}

export default function Room360ViewModal({
    propertyId,
    isOpen,
    onClose,
    roomId,
    roomName,
    currentView360Link = '',
    onSuccess,
}: Props) {
    const { t } = useTranslation()
    const [view360Link, setView360Link] = React.useState(currentView360Link)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isImageUploadOpen, setIsImageUploadOpen] = React.useState(false)
    const [error, setError] = React.useState('')

    // Update link when modal opens with existing value
    React.useEffect(() => {
        if (isOpen) {
            setView360Link(currentView360Link || '')
            setError('')
        }
    }, [isOpen, currentView360Link])

    const handleImageUploadSuccess = (uploadedUrls: string[]) => {
        if (uploadedUrls.length > 0) {
            setView360Link(uploadedUrls[0]) // Use the first uploaded image
            setError('')
        }
    }

    const handleSave = async () => {
        if (!view360Link.trim()) {
            setError(t('Rooms.pleaseProvide360Link'))
            return
        }

        setIsUploading(true)
        setError('')

        try {
            const response = await add360ToRoom(propertyId, roomId, view360Link)

            if (response.success) {
                toast.success(t('Rooms.view360Updated'))
                onSuccess()
                onClose()
            } else {
                setError(response.message || t('Rooms.failedToUpdate360View'))
                toast.error(response.message || t('Rooms.failedToUpdate360View'))
            }
        } catch (err: any) {
            const errorMsg = err?.message || t('Rooms.failedToUpdate360View')
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        if (!isUploading) {
            onClose()
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {t('Rooms.add360ViewFor', { name: roomName })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Rooms.upload360Description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="view360Link">
                                {t('Rooms.view360Link')}
                            </Label>
                            <Input
                                id="view360Link"
                                placeholder={t('Rooms.view360Placeholder')}
                                value={view360Link}
                                onChange={(e) => {
                                    setView360Link(e.target.value)
                                    setError('')
                                }}
                                disabled={isUploading}
                            />
                            <p className="text-xs text-gray-500">
                                {t('Rooms.enter360Url')}
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    {t('Rooms.orUploadImage')}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsImageUploadOpen(true)}
                            disabled={isUploading}
                            className="w-full"
                        >
                            {t('Rooms.upload360Image')}
                        </Button>

                        {view360Link && (
                            <div className="rounded-lg border p-3 bg-gray-50">
                                <Label className="text-xs text-gray-600">{t('Rooms.previewLink')}</Label>
                                <p className="text-sm break-all mt-1">{view360Link}</p>
                            </div>
                        )}

                        {error && <Badge variant="destructive" className="w-full justify-center">{error}</Badge>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                            {t('Rooms.cancel')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isUploading || !view360Link.trim()}
                            className="bg-black text-white"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    {t('Rooms.saving')}
                                </>
                            ) : (
                                t('Rooms.save360View')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ImageUploadModal
                isOpen={isImageUploadOpen}
                onClose={() => setIsImageUploadOpen(false)}
                // uploadImages={uploadImages}
                onUploadSuccess={handleImageUploadSuccess}
            />
        </>
    )
}
