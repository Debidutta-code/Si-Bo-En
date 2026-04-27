import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ISpa, ISpaUser } from '../interfaces';

interface SpaAssignUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpa: ISpa | null;
  spaUsers: ISpaUser[];
  selectedUserForAssign: string;
  setSelectedUserForAssign: (val: string) => void;
  handleAssignUser: () => void;
}

export default function SpaAssignUserDialog({
  isOpen,
  onClose,
  selectedSpa,
  spaUsers,
  selectedUserForAssign,
  setSelectedUserForAssign,
  handleAssignUser
}: SpaAssignUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign User to {selectedSpa?.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Select User</Label>
            <select 
              className="w-full border rounded-md p-2" 
              value={selectedUserForAssign} 
              onChange={(e) => setSelectedUserForAssign(e.target.value)}
            >
              <option value="">-- Choose User --</option>
              {spaUsers.map(user => (
                <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</option>
              ))}
            </select>
          </div>
          
          {/* Show already assigned users if available */}
          {selectedSpa?.AssignedSpas && selectedSpa.AssignedSpas.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm text-gray-500 mb-2 block">Currently Assigned Users:</Label>
              <ul className="space-y-1">
                {selectedSpa.AssignedSpas.map((assignment, idx) => (
                  <li key={idx} className="text-sm bg-gray-50 p-2 rounded">
                    {assignment.User.firstName} {assignment.User.lastName} ({assignment.User.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssignUser} disabled={!selectedUserForAssign}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
