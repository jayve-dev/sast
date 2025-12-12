"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit, Eye, EyeOff, AlertCircle } from "lucide-react";

const editUserSchema = z.object({
  idNumber: z.string().min(1, "ID number is required"),
  fullName: z.string().min(1, "Full name is required"),
  password: z.string().optional(),
});

type FormData = z.infer<typeof editUserSchema>;

interface UserEditProps {
  user: {
    id: string;
    idNumber: number;
    fullName: string;
  };
}

export function UserEdit({ user }: UserEditProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      idNumber: user.idNumber.toString(),
      fullName: user.fullName,
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        idNumber: Number(data.idNumber),
        fullName: data.fullName,
      };

      // Only include password if it was changed
      if (data.password && data.password.trim()) {
        payload.password = data.password;
      }

      const response = await fetch(`/api/create/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError(result.message || "ID number not found in student records");
        } else if (response.status === 400) {
          setError(result.message || "Name does not match student records");
        } else if (response.status === 409) {
          setError(result.message || "ID number already in use");
        } else {
          throw new Error(result.message || "Failed to update user");
        }
        setIsLoading(false);
        return;
      }

      toast.success("User updated successfully");
      setOpen(false);
      form.reset({
        idNumber: result.user.idNumber.toString(),
        fullName: result.user.fullName,
        password: "",
      });
      setError(null);
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='gap-2'>
          <Edit className='w-4 h-4' />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. ID number and name must match student
            records.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name='idNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='1234567'
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Juan Dela Cruz'
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder='Leave blank to keep current'
                        disabled={isLoading}
                      />
                      <button
                        type='button'
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg'>
              <p className='font-medium text-blue-900 mb-1'>Note:</p>
              <p className='text-blue-800'>
                The ID number and name must match our student records. Leave
                password blank to keep the current password.
              </p>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  form.reset({
                    idNumber: user.idNumber.toString(),
                    fullName: user.fullName,
                    password: "",
                  });
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
