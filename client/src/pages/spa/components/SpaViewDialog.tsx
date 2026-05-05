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
  const [userToRemove, setUserToRemove] = useState<{ spaId: string; userId: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    setIsRemoving(true);
    const result = await removeUserFromSpaService(userToRemove.spaId, userToRemove.userId);
    if (result.success !== false) {
      toast.success('User removed from spa successfully');
      if (onUpdate) onUpdate();
      else onClose(); // Close if no update callback provided so they can reopen to see changes
    } else {
      toast.error(result.message || 'Failed to remove user');
    }
    setIsRemoving(false);
    setUserToRemove(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Spa/Activity Details</DialogTitle>
          </DialogHeader>
          {selectedSpa && (
            <div className="space-y-6">
              {selectedSpa.images && selectedSpa.images.length > 0 && (
                <ImageSlider images={selectedSpa.images} height="h-80" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Name</h3>
                  <p className="text-lg">{selectedSpa.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Item Code</h3>
                  <p className="text-lg">{selectedSpa.itemCode}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-gray-500 text-sm">Description</h3>
                  <p className="whitespace-pre-wrap">{selectedSpa.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Category</h3>
                  <p>{selectedSpa.Category?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Sub-Category</h3>
                  <p>{selectedSpa.SubCategory?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Location</h3>
                  <p>{selectedSpa.location || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Service Time</h3>
                  <p>{selectedSpa.serviceTime} mins</p>
                </div>
                
                {!selectedSpa.isInclusive && (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">Discount Value</h3>
                      <p>{selectedSpa.discountValue || 'None'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm">Currency</h3>
                      <p>{selectedSpa.currencyCode || 'N/A'}</p>
                    </div>
                  </>
                )}

                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Status</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedSpa.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedSpa.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm">Is Inclusive</h3>
                  <p>{selectedSpa.isInclusive ? 'Yes' : 'No'}</p>
                </div>

                {selectedSpa.AssignedSpas && selectedSpa.AssignedSpas.length > 0 && (
                  <div className="col-span-2 mt-4 pt-4 border-t">
                    <h3 className="font-semibold text-gray-500 text-sm mb-2">Assigned Users</h3>
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
                            title="Remove user from this spa"
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
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Assigned User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to remove this user from the spa?</p>
            <p className="text-sm text-gray-500 mt-2">
              The Spa Manager can no longer manage this spa once removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToRemove(null)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveUser} disabled={isRemoving}>
              {isRemoving ? 'Removing...' : 'Remove User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
  );
}
