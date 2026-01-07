'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import { mockUsers } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Mail, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    linkedProperty: '',
    level: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Form submitted:', formData);
    setIsDialogOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      linkedProperty: '',
      level: ''
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      width: 'w-64',
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
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
      width: 'w-32',
      render: (value: string) => (
        <Badge variant={value === 'Admin' ? 'destructive' : value === 'Manager' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'level',
      header: 'Level',
      width: 'w-24',
      render: (value: string) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: 'linkedProperty',
      header: 'Linked Property',
      width: 'w-48',
      render: (value: string) => value || '-'
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      width: 'w-32',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (_: any, _row: any) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage system user accounts with role-based access
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new system user with appropriate role and property access
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value:any) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value:any) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Mid">Mid</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedProperty">Linked Property (Optional)</Label>
                <Select value={formData.linkedProperty} onValueChange={(value:any) => setFormData({...formData, linkedProperty: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grand Plaza Hotel">Grand Plaza Hotel</SelectItem>
                    <SelectItem value="Oceanview Resort">Oceanview Resort</SelectItem>
                    <SelectItem value="City Center Inn">City Center Inn</SelectItem>
                    <SelectItem value="Mountain View Lodge">Mountain View Lodge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{mockUsers.length}</div>
          <p className="text-sm text-gray-600">Total Users</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {mockUsers.filter(u => u.role === 'Admin').length}
          </div>
          <p className="text-sm text-gray-600">Administrators</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {mockUsers.filter(u => u.role === 'Manager').length}
          </div>
          <p className="text-sm text-gray-600">Managers</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {mockUsers.filter(u => u.linkedProperty).length}
          </div>
          <p className="text-sm text-gray-600">Linked to Properties</p>
        </Card>
      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <p className="text-sm text-gray-600">
            Manage system users and their access levels
          </p>
        </div>

        <DataTable
          data={mockUsers}
          columns={columns}
          searchKey="firstName"
          searchPlaceholder="Search users..."
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}