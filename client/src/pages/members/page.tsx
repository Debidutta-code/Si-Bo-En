
import { useEffect, useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Edit } from 'lucide-react';
import { z } from 'zod';
import { getRoles, getUsers, createUser, deleteUserById, updateUserById } from "./api/index"
import type { IUser, IRoleAccess, ICreateUser } from "./types/types"
import toast from 'react-hot-toast';
import { capitalizeFirstLetter } from "@/lib/utils"
import Loader from '@/components/Loader/Loader';
import CreateMemberDialog from '@/components/manageMembers/createUserDialog';
import EditMemberDialog from '@/components/manageMembers/updateUserDialog';
import DeleteConfirmationDialog from '@/components/manageMembers/DeleteUserDialog';

export default function MembersPage() {

  const [users, setUsers] = useState<IUser[]>([])
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [roles, setRoles] = useState<IRoleAccess[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected user for edit/delete operations
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getUsers(1); // Assuming page 1
      setUsers(res.data)
    } catch (error) {
      toast.error("Failed to fetch members")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data)
    } catch (error) {
      toast.error("Failed to fetch roles")
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // Create User Handler
  const handleCreateUser = async (formData: ICreateUser) => {
    setErrors([]);
    setLoading(true);

    try {
      const finalSchema = z.object({
        firstName: z.string().min(1, 'First name is required.').max(50, 'First name must be at most 50 characters.').trim(),
        lastName: z.string().min(1, 'Last name is required.').max(50, 'Last name must be at most 50 characters.').trim(),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
          .string()
          .min(6, { message: "Password must be at least 6 characters long." })
          .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
          .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
          .regex(/[0-9]/, { message: "Password must contain at least one number." }),
        confirmPassword: z
          .string()
          .min(6, { message: "Password must be at least 6 characters long." })
          .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
          .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
          .regex(/[0-9]/, { message: "Password must contain at least one number." }),
        role: z.string().min(1, 'Role is required.'),
        level: z.number()
      }).refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Passwords don't match.",
          path: ['confirmPassword'],
        }
      );

      const validation = finalSchema.safeParse(formData);

      if (!validation.success) {
        setErrors(validation.error.issues);
        setLoading(false);
        return;
      }

      const res = await createUser(validation.data);
      // console.log('Create user response:', res);
      if (res.success) {
        toast.success("User created successfully");
        setIsCreateDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(res.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Update User Handler
  const handleUpdateUser = async (formData: ICreateUser) => {
    if (!editingUser) return;

    setErrors([]);
    setLoading(true);
    const finalSchema = z.object({
      firstName: z.string().min(1, 'First name is required.').max(50, 'First name must be at most 50 characters.').trim(),
      lastName: z.string().min(1, 'Last name is required.').max(50, 'Last name must be at most 50 characters.').trim(),
      email: z.string().email({ message: "Invalid email address" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." }),
      confirmPassword: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[@$&]/, { message: "Password must contain one of the special characters: @, $, &." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." }),
      role: z.string().min(1, 'Role is required.'),
      level: z.number()
    }).refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      }
    );

    const validation = finalSchema.safeParse(formData);

    if (!validation.success) {
      setErrors(validation.error.issues);
      setLoading(false);
      return;
    }
    try {
      // For update, we might not require password if not changing it
      let updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        level: formData.level
      };

      // Only include password if it's provided
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          setErrors([{
            code: "custom",
            message: "Passwords don't match.",
            path: ['confirmPassword']
          }]);
          setLoading(false);
          return;
        }
        updateData.password = formData.password;
      }

      const res = await updateUserById(editingUser.id, updateData);

      if (res.success) {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(res.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };



  const confirmDeleteUser = async () => {
    // console.log(userToDelete)
    if (!userToDelete) {
      toast.error("User Not Found")
      return
    }
    try {
      setLoading(true);
      const response = await deleteUserById(userToDelete.id);
      if (response.success) {
        toast.success("User deleted successfully");
        fetchUsers();
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Member',
      width: 'w-64',
      render: (_: any, row: IUser) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {row.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      width: 'w-40',
      render: (value: string) => (
        <Badge variant="outline">
          {value ? capitalizeFirstLetter(value) : 'N/A'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (_: any, row: IUser) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingUser(row);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DeleteConfirmationDialog
            user={row}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDeleteUser}
            loading={loading}
            setUserToDelete={setUserToDelete}
          />
        </div>
      )
    }
  ];

  if (loading && users.length === 0) {
    return (
      <div className='min-h-screen w-full flex justify-center items-center'>
        <Loader text='Loading Users' />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage member accounts and their property associations
          </p>
        </div>

        <CreateMemberDialog
          roles={roles}
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateUser}
          errors={errors}
          loading={loading}
        />
      </div>

      {/* Edit User Dialog */}
      <EditMemberDialog
        user={editingUser}
        roles={roles}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateUser}
        errors={errors}
        loading={loading}
      />

      {/* Members Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Members</h2>
          <p className="text-sm text-gray-600">
            View and manage all member accounts
          </p>
        </div>

        <DataTable
          data={users}
          columns={columns}
          searchKey="firstName"
          searchPlaceholder="Search members..."
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}