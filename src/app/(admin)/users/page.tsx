"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { UserAdd } from "@/components/student/user-add";
import { UserEdit } from "@/components/student/user-edit";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Search } from "lucide-react";

interface Users {
  id: string;
  idNumber: number;
  fullName: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Users[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(
      (user) =>
        user.role === "STUDENT" &&
        (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.idNumber.toString().includes(searchTerm))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/create/user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data.filter((user: Users) => user.role === "STUDENT"));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/create/user/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user");
      }

      toast.success(`${name} has been deleted successfully`);

      // Refresh the list
      fetchStudents();
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen text-black'>
      <div className='mt-10 p-4'>
        <div className='flex flex-row items-center gap-2 justify-between mb-6'>
          <div className='flex gap-4 flex-1 max-w-md'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name or ID number...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='bg-white pl-9'
              />
            </div>
          </div>
          <UserAdd />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Total Students</p>
            <p className='text-2xl font-bold'>
              {users.filter((u) => u.role === "STUDENT").length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Displayed</p>
            <p className='text-2xl font-bold'>{filteredUsers.length}</p>
          </div>
          <div className='bg-white p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Search Results</p>
            <p className='text-2xl font-bold'>
              {searchTerm ? filteredUsers.length : "-"}
            </p>
          </div>
        </div>

        <div className='mt-8 bg-white rounded-lg border text-black'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>#</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8'>
                    <p className='text-muted-foreground'>
                      {searchTerm
                        ? "No users found matching your search"
                        : "No student accounts found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, idx) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>{idx + 1}</TableCell>
                    <TableCell>
                      <span className='font-mono'>{user.idNumber}</span>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {user.fullName}
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{user.role}</Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <UserEdit user={user} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='gap-2 text-destructive hover:text-destructive hover:bg-destructive/10'
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                              ) : (
                                <Trash2 className='w-4 h-4' />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the account for{" "}
                                <span className='font-semibold'>
                                  {user.fullName}
                                </span>{" "}
                                (ID: {user.idNumber}). This action cannot be
                                undone and will also delete all their responses
                                and suggestions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(user.id, user.fullName)
                                }
                                className='bg-destructive hover:bg-destructive/90'
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
