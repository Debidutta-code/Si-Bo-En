import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Shield, Settings, Users, Activity, Save, MoreVertical, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { IAccess } from './types/type';
import { getAllRoles, getAccessByRole, createNewRole, modifyStaff, deleteRole } from './api/index';
import Loader from '@/components/Loader/Loader';
import toast from 'react-hot-toast';

export default function AccessControlPage() {
  const [roles, setRoles] = useState<IAccess[]>([]);
  const [selectedRole, setSelectedRole] = useState<IAccess | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [newRole, setNewRole] = useState({
    roleName: '',
    roleLevel: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch all roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await getAllRoles();
        setRoles(data.data || []);
        if (data.data?.length > 0) {
          setSelectedRole(data.data[0]);
          handleRoleChange(data.data[0].role);
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleRoleChange = async (role: string) => {
    setLoading(true);
    try {
      const data = await getAccessByRole({ role } as IAccess);
      setSelectedRole(data?.data || null);
    } catch (err) {
      console.error('Failed to fetch role details', err);
      toast.error('Could not load role details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (field: keyof IAccess) => {
    if (selectedRole) {
      setSelectedRole({
        ...selectedRole,
        [field]: !selectedRole[field],
      });
    }
  };

  const saveRole = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await modifyStaff(selectedRole);
      setRoles((prev) => prev.map((r) => (r.role === selectedRole.role ? selectedRole : r)));
      if (res.success) {
        toast.success('Role updated successfully!');
      } else {
        toast.error(res?.message || 'Failed to update role.');
      }
    } catch (err) {
      toast.error('Failed to save role.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.roleName.trim()) {
      toast.error('Role name is required.');
      return;
    }

    const role: IAccess = {
      role: newRole.roleName.trim(),
      level: newRole.roleLevel,
      isActive: true,
      canCreateHotel: false,
      canUpdateHotel: false,
      canDeleteHotel: false,
      canViewHotel: false,
      canUpdatePaymentDetails: false,
      canCreateRatePlan: false,
      canViewRatePlan: false,
      canUpdateRatePlan: false,
      canDeleteRatePlan: false,
      canAddInventory: false,
      canCreateRoomAvailability: false,
      canMapRatePlan: false,
      canUpdateRoomPrice: false,
      canSeeBookingDetails: false,
      canUpdateBookingStatus: false,
      canViewAnalytics: false,
      canCreateMembers: false,
      canViewMembers: false,
      canUpdateMembers: false,
      canDeleteMembers: false,
      canCreateLevel0User: false,
      canCreateLevel1User: false,
      canCreateLevel2User: false,
      canCreateLevel3User: false,
      canUpdateLevel0User: false,
      canUpdateLevel1User: false,
      canUpdateLevel2User: false,
      canUpdateLevel3User: false,
      canDeleteLevel0User: false,
      canDeleteLevel1User: false,
      canDeleteLevel2User: false,
      canDeleteLevel3User: false,
      canViewLogs: false,
      canCreateNewRole: false,
      canViewAccess: false,
      canModifyAccess: false,
      canDeleteRole: false,
      canCreatePolicy: false,
      canUpdatePolicy: false,
      canDeletePolicy: false,
      canCDCategory: false,
      canCDPropertyType: false,
      canCDDestinationType: false,
      canCDAmenity: false,
      canSeeDraftedProperties: false,
    };

    setLoading(true);
    try {
      const res = await createNewRole(role);
      if (res.success) {
        setRoles([...roles, role]);
        setNewRole({ roleName: '', roleLevel: 0 });
        setIsDialogOpen(false);
        toast.success('Role created successfully!');
      } else {
        toast.error(res?.message || 'Failed to create role.');
      }
    } catch (err) {
      toast.error('Failed to create role.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!roleName.trim()) {
      toast.error('Please enter a role name to delete.');
      return;
    }

    setLoading(true);
    try {
      const res = await deleteRole(roleName);
      if (res.success) {
        setRoles(roles.filter((r) => r.role !== roleName));
        if (selectedRole?.role === roleName) {
          setSelectedRole(roles.length > 1 ? roles.find((r) => r.role !== roleName) || null : null);
        }
        setNewRole({ roleName: '', roleLevel: 0 });
        setDeleteDialogOpen(false);
        toast.success('Role deleted successfully!');
      } else {
        toast.error(res?.message || 'Failed to delete role.');
      }
    } catch (err) {
      toast.error('Failed to delete role.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !roles.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader text="Loading Roles and Access" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Access & Role Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage roles and their permissions across the system
                </p>
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-2 space-y-1">
                {/* Create Role */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      className="p-0 cursor-pointer"
                      onSelect={(e) => e.preventDefault()} // 👈 Prevent dropdown from closing & conflicting
                    >
                      <Button variant="ghost" className="w-full justify-start px-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                      </Button>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Role
                      </DialogTitle>
                      <DialogDescription>
                        Enter a name and level for the new role. All permissions start disabled.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input
                          id="roleName"
                          value={newRole.roleName}
                          onChange={(e) =>
                            setNewRole({ ...newRole, roleName: e.target.value })
                          }
                          placeholder="e.g., Manager, Admin"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleLevel">Role Level</Label>
                        <Input
                          id="roleLevel"
                          type="number"
                          min="0"
                          max="3"
                          value={newRole.roleLevel}
                          onChange={(e) =>
                            setNewRole({
                              ...newRole,
                              roleLevel: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0-3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole}>Create Role</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Role */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      className="p-0 cursor-pointer text-red-500 focus:text-red-500"
                      onSelect={(e) => e.preventDefault()} // 👈 Critical: Prevent default dropdown behavior
                    >
                      <Button variant="ghost" className="w-full justify-start px-2 text-red-500">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Role
                      </Button>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash className="h-5 w-5" />
                        Delete Role
                      </DialogTitle>
                      <DialogDescription>
                        Enter the name of the role to confirm deletion.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                      <Label htmlFor="confirmDeleteRoleName">Role Name</Label>
                      <Input
                        id="confirmDeleteRoleName"
                        value={newRole.roleName} // ← Still using same, but see improvement below
                        onChange={(e) =>
                          setNewRole({ ...newRole, roleName: e.target.value })
                        }
                        placeholder="Enter role name"
                        className="focus:ring-red-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteRole(newRole.roleName)}
                      >
                        Delete Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Role Selector */}
        <Card className="bg-card border border-border mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg text-foreground">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Select Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedRole?.role || ''}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-full sm:w-72 h-12 text-sm">
                <SelectValue placeholder="Select a role to manage" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.role} value={role.role}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{role.role}</span>
                      {role.level !== undefined && (
                        <Badge variant="secondary" className="ml-2 px-2 text-xs">
                          L{role.level}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        {selectedRole && (
          <Card className="bg-card border border-border overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {selectedRole.role}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-primary border-primary text-sm px-2.5">
                        Level {selectedRole.level}
                      </Badge>
                      <Badge
                        variant={selectedRole.isActive ? 'default' : 'secondary'}
                        className="flex items-center text-xs"
                      >
                        <Activity className={`h-3 w-3 mr-1 ${selectedRole.isActive ? 'text-green-500' : 'text-gray-500'}`} />
                        {selectedRole.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveRole}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11 self-start sm:self-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-8">
              {/* Hotel Management */}
              <Section title="Hotel Management" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="View Hotel"
                  checked={selectedRole.canViewHotel}
                  onChange={() => handlePermissionToggle('canViewHotel')}
                />
                <PermissionToggle
                  label="Create Hotel"
                  checked={selectedRole.canCreateHotel}
                  onChange={() => handlePermissionToggle('canCreateHotel')}
                />
                <PermissionToggle
                  label="Update Hotel"
                  checked={selectedRole.canUpdateHotel}
                  onChange={() => handlePermissionToggle('canUpdateHotel')}
                />
                <PermissionToggle
                  label="Delete Hotel"
                  checked={selectedRole.canDeleteHotel}
                  onChange={() => handlePermissionToggle('canDeleteHotel')}
                />
              </Section>

              {/* Payment */}
              <Section title="Payment" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="Update Payment Details"
                  checked={selectedRole.canUpdatePaymentDetails}
                  onChange={() => handlePermissionToggle('canUpdatePaymentDetails')}
                />
              </Section>

              {/* Rate Plan */}
              <Section title="Rate Plan Management" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="View Rate Plan"
                  checked={selectedRole.canViewRatePlan}
                  onChange={() => handlePermissionToggle('canViewRatePlan')}
                />
                <PermissionToggle
                  label="Create Rate Plan"
                  checked={selectedRole.canCreateRatePlan}
                  onChange={() => handlePermissionToggle('canCreateRatePlan')}
                />
                <PermissionToggle
                  label="Update Rate Plan"
                  checked={selectedRole.canUpdateRatePlan}
                  onChange={() => handlePermissionToggle('canUpdateRatePlan')}
                />
                <PermissionToggle
                  label="Delete Rate Plan"
                  checked={selectedRole.canDeleteRatePlan}
                  onChange={() => handlePermissionToggle('canDeleteRatePlan')}
                />
              </Section>

              {/* Inventory */}
              <Section title="Inventory & Availability" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="Add Inventory"
                  checked={selectedRole.canAddInventory}
                  onChange={() => handlePermissionToggle('canAddInventory')}
                />
                <PermissionToggle
                  label="Create Room Availability"
                  checked={selectedRole.canCreateRoomAvailability}
                  onChange={() => handlePermissionToggle('canCreateRoomAvailability')}
                />
                <PermissionToggle
                  label="Map Rate Plan"
                  checked={selectedRole.canMapRatePlan}
                  onChange={() => handlePermissionToggle('canMapRatePlan')}
                />
                <PermissionToggle
                  label="Update Room Price"
                  checked={selectedRole.canUpdateRoomPrice}
                  onChange={() => handlePermissionToggle('canUpdateRoomPrice')}
                />
              </Section>

              {/* Booking */}
              <Section title="Booking" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="See Booking Details"
                  checked={selectedRole.canSeeBookingDetails}
                  onChange={() => handlePermissionToggle('canSeeBookingDetails')}
                />
                <PermissionToggle
                  label="Update Booking Status"
                  checked={selectedRole.canUpdateBookingStatus}
                  onChange={() => handlePermissionToggle('canUpdateBookingStatus')}
                />
              </Section>

              {/* Analytics */}
              <Section title="Analytics" icon={<Activity className="h-5 w-5" />}>
                <PermissionToggle
                  label="View Analytics"
                  checked={selectedRole.canViewAnalytics}
                  onChange={() => handlePermissionToggle('canViewAnalytics')}
                />
              </Section>

              {/* Members */}
              <Section title="Members Management" icon={<Users className="h-5 w-5" />}>
                <PermissionToggle
                  label="View Members"
                  checked={selectedRole.canViewMembers}
                  onChange={() => handlePermissionToggle('canViewMembers')}
                />
                <PermissionToggle
                  label="Create Members"
                  checked={selectedRole.canCreateMembers}
                  onChange={() => handlePermissionToggle('canCreateMembers')}
                />
                <PermissionToggle
                  label="Update Members"
                  checked={selectedRole.canUpdateMembers}
                  onChange={() => handlePermissionToggle('canUpdateMembers')}
                />
                <PermissionToggle
                  label="Delete Members"
                  checked={selectedRole.canDeleteMembers}
                  onChange={() => handlePermissionToggle('canDeleteMembers')}
                />
              </Section>

              {/* User Management */}
              <Section title="User Management (by Level)" icon={<Users className="h-5 w-5" />}>
                {([0, 1, 2, 3] as const).map((level) => (
                  <div key={level} className="col-span-full sm:col-span-2 lg:col-span-3">
                    <div className="flex items-center mb-3">
                      <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary font-medium px-3 py-1">
                        Level {level} Users
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <PermissionToggle
                        label={`Create Level ${level} User`}
                        checked={selectedRole[`canCreateLevel${level}User`]}
                        onChange={() => handlePermissionToggle(`canCreateLevel${level}User`)}
                      />
                      <PermissionToggle
                        label={`Update Level ${level} User`}
                        checked={selectedRole[`canUpdateLevel${level}User`]}
                        onChange={() => handlePermissionToggle(`canUpdateLevel${level}User`)}
                      />
                      <PermissionToggle
                        label={`Delete Level ${level} User`}
                        checked={selectedRole[`canDeleteLevel${level}User`]}
                        onChange={() => handlePermissionToggle(`canDeleteLevel${level}User`)}
                      />
                    </div>
                  </div>
                ))}
              </Section>

              {/* Logs */}
              <Section title="Logs" icon={<Activity className="h-5 w-5" />}>
                <PermissionToggle
                  label="View Logs"
                  checked={selectedRole.canViewLogs}
                  onChange={() => handlePermissionToggle('canViewLogs')}
                />
              </Section>

              {/* Role & Access */}
              <Section title="Role & Access Management" icon={<Shield className="h-5 w-5" />}>
                <PermissionToggle
                  label="Create New Role"
                  checked={selectedRole.canCreateNewRole}
                  onChange={() => handlePermissionToggle('canCreateNewRole')}
                />
                <PermissionToggle
                  label="View Access"
                  checked={selectedRole.canViewAccess}
                  onChange={() => handlePermissionToggle('canViewAccess')}
                />
                <PermissionToggle
                  label="Modify Access"
                  checked={selectedRole.canModifyAccess}
                  onChange={() => handlePermissionToggle('canModifyAccess')}
                />
                <PermissionToggle
                  label="Delete Role"
                  checked={selectedRole.canDeleteRole}
                  onChange={() => handlePermissionToggle('canDeleteRole')}
                />
              </Section>

              {/* Policy */}
              <Section title="Policy Management" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="Create Policy"
                  checked={selectedRole.canCreatePolicy}
                  onChange={() => handlePermissionToggle('canCreatePolicy')}
                />
                <PermissionToggle
                  label="Update Policy"
                  checked={selectedRole.canUpdatePolicy}
                  onChange={() => handlePermissionToggle('canUpdatePolicy')}
                />
                <PermissionToggle
                  label="Delete Policy"
                  checked={selectedRole.canDeletePolicy}
                  onChange={() => handlePermissionToggle('canDeletePolicy')}
                />
              </Section>

              {/* Custom Data */}
              <Section title="Custom Data Management" icon={<Settings className="h-5 w-5" />}>
                <PermissionToggle
                  label="Manage Categories"
                  checked={selectedRole.canCDCategory}
                  onChange={() => handlePermissionToggle('canCDCategory')}
                />
                <PermissionToggle
                  label="Manage Property Types"
                  checked={selectedRole.canCDPropertyType}
                  onChange={() => handlePermissionToggle('canCDPropertyType')}
                />
                <PermissionToggle
                  label="Manage Destination Types"
                  checked={selectedRole.canCDDestinationType}
                  onChange={() => handlePermissionToggle('canCDDestinationType')}
                />
                <PermissionToggle
                  label="Manage Amenities"
                  checked={selectedRole.canCDAmenity}
                  onChange={() => handlePermissionToggle('canCDAmenity')}
                />
                <PermissionToggle
                  label="View Drafted Properties"
                  checked={selectedRole.canSeeDraftedProperties}
                  onChange={() => handlePermissionToggle('canSeeDraftedProperties')}
                />
              </Section>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Section Component
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-6 border-t border-border first:border-t-0 first:pt-0">
      <div className="flex items-center mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
          <span className="text-primary">{icon}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}

// Permission Toggle Component
function PermissionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`
        flex items-center p-3 sm:p-4 rounded-xl border text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${checked
          ? 'border-primary bg-primary/5 text-foreground shadow-sm'
          : 'border-border bg-white hover:border-muted-foreground/30'
        }
        hover:shadow-md hover:scale-[1.01]
      `}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
    >
      <span className="flex-1">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </label>
  );
}