"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { AdminAdd } from "@/components/admin/admin-add";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Users {
  id: string;
  idNumber: number;
  fullName: string;
  course: string;
  section: string;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<Users[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit states
  const [editUser, setEditUser] = useState<Users | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    idNumber: "",
    fullName: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/create/admin");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
      toast.error("Failed to load admin accounts");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/create/admin/${deleteId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete admin");
      }

      toast.success("Admin account deleted successfully");
      setUsers(users.filter((user) => user.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete admin";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (user: Users) => {
    setEditUser(user);
    setEditFormData({
      idNumber: user.idNumber.toString(),
      fullName: user.fullName,
      password: "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setIsEditing(true);
    try {
      const payload: {
        idNumber: number;
        fullName: string;
        password?: string;
      } = {
        idNumber: Number(editFormData.idNumber),
        fullName: editFormData.fullName,
      };

      // Only include password if it's not empty
      if (editFormData.password.trim()) {
        payload.password = editFormData.password;
      }

      const res = await fetch(`/api/create/admin/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update admin");
      }

      toast.success("Admin account updated successfully");

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editUser.id
            ? {
                ...user,
                idNumber: payload.idNumber,
                fullName: payload.fullName,
              }
            : user
        )
      );

      setEditUser(null);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update admin";
      toast.error(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className='w-full min-h-screen'>
        <div className='mt-10 p-4 '>
          <div className='flex flex-row items-center gap-2 justify-between'>
            <div className='flex gap-4'>
              <Input
                placeholder='Enter account name'
                className='bg-white min-w-100 mx-auto'
              />
            </div>
            <AdminAdd />
          </div>

          <div className='mt-8'>
            <Table className='bg-white text-black rounded-lg'>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>ID #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((user) => user.role === "ADMIN")
                  .map((user, idx) => (
                    <TableRow key={user.id}>
                      <TableCell className='font-medium'>{idx + 1}</TableCell>
                      <TableCell>{user.idNumber}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.preventDefault()}
                          >
                            <Ellipsis />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Action</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditClick(user)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={(e) => {
                                setDeleteId(user.id);
                                e.preventDefault();
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                admin account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className='bg-red-600 hover:bg-red-700'
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <Dialog open={editUser !== null} onOpenChange={() => setEditUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin Account</DialogTitle>
              <DialogDescription>
                Update the admin account information. Leave password blank to
                keep current password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='edit-idNumber'>ID Number</Label>
                  <Input
                    id='edit-idNumber'
                    type='number'
                    readOnly
                    value={editFormData.idNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        idNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='edit-fullName'>Full Name</Label>
                  <Input
                    id='edit-fullName'
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditUser(null)}
                  disabled={isEditing}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isEditing}>
                  {isEditing ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
