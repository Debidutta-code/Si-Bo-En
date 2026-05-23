import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ImageSlider from '@/components/shared/ImageSlider';
import type { ISpa } from '../interfaces';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { removeUserFromSpaService } from '../services';
import toast from 'react-hot-toast';

interface SpaViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpa: ISpa | null;
  onUpdate?: () => void;
}

export default function SpaViewDialog({ isOpen, onClose, selectedSpa, onUpdate }: SpaViewDialogProps) {
  const { t } = useTranslation();
  const [userToRemove, setUserToRemove] = useState<{ spaId: string; userId: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    setIsRemoving(true);
    const result = await removeUserFromSpaService(userToRemove.spaId, userToRemove.userId);
    if (result.success !== false) {
      toast.success(t('SpaViewDialog.toast.removeSuccess'));
      if (onUpdate) onUpdate();
      else onClose();
    } else {
      toast.error(result.message || t('SpaViewDialog.toast.removeFailed'));
    }
    setIsRemoving(false);
    setUserToRemove(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('SpaViewDialog.title')}</DialogTitle>
          </DialogHeader>
          {selectedSpa && (
            <div className="space-y-6">
              {selectedSpa.images && selectedSpa.images.length > 0 && (
                <ImageSlider images={selectedSpa.images} height="h-80" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.name')}</h3>
                  <p className="text-lg">{selectedSpa.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.itemCode')}</h3>
                  <p className="text-lg">{selectedSpa.itemCode}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.description')}</h3>
                  <p className="whitespace-pre-wrap">{selectedSpa.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.category')}</h3>
                  <p>{selectedSpa.Category?.name || t('SpaViewDialog.fields.na')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.subCategory')}</h3>
                  <p>{selectedSpa.SubCategory?.name || t('SpaViewDialog.fields.na')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.location')}</h3>
                  <p>{selectedSpa.location || t('SpaViewDialog.fields.na')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.serviceTime')}</h3>
                  <p>{selectedSpa.serviceTime} {t('SpaViewDialog.fields.mins')}</p>
                </div>
                
                {!selectedSpa.isInclusive && (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.discountValue')}</h3>
                      <p>{selectedSpa.discountValue || t('SpaViewDialog.fields.none')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.currency')}</h3>
                      <p>{selectedSpa.currencyCode || t('SpaViewDialog.fields.na')}</p>
                    </div>
                  </>
                )}

                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.status')}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedSpa.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedSpa.isActive ? t('SpaViewDialog.fields.active') : t('SpaViewDialog.fields.inactive')}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">{t('SpaViewDialog.fields.isInclusive')}</h3>
                  <p>{selectedSpa.isInclusive ? t('SpaViewDialog.fields.yes') : t('SpaViewDialog.fields.no')}</p>
                </div>

                {selectedSpa.AssignedSpas && selectedSpa.AssignedSpas.length > 0 && (
                  <div className="col-span-2 mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-gray-500 text-sm mb-2">{t('SpaViewDialog.assignedUsers.label')}</h3>
                    <ul className="space-y-2">
                      {selectedSpa.AssignedSpas.map((assignment, idx) => (
                        <li key={idx} className="text-sm bg-gray-50 p-2 rounded border flex justify-between items-center">
                          <div>
                            <span className="font-medium">{assignment.User.firstName} {assignment.User.lastName}</span>
                            <div className="text-gray-500">{assignment.User.email}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setUserToRemove({ spaId: selectedSpa.id, userId: assignment.User.id })}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title={t('SpaViewDialog.removeUserDialog.remove')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{t('SpaViewDialog.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('SpaViewDialog.removeUserDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('SpaViewDialog.removeUserDialog.confirm')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('SpaViewDialog.removeUserDialog.warning')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToRemove(null)} disabled={isRemoving}>
              {t('SpaViewDialog.removeUserDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRemoveUser} disabled={isRemoving}>
              {isRemoving ? t('SpaViewDialog.removeUserDialog.removing') : t('SpaViewDialog.removeUserDialog.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}