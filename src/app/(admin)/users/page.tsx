"use client";
import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { AdminAdd } from "@/components/admin/admin-add";

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const response = await fetch("/api/create/admin");
    const data = await response.json();
    setUsers(data);
  };

  // fetchStudents();

  return (
    <>
      <div className='w-full min-h-screen'>
        <div className='mt-10 p-4 '>
          <div className='flex flex-row items-center gap-2 justify-between'>
            <div className='flex gap-4'>
              <Input
                placeholder='Enter account name'
                className='bg-white min-w-[400px] mx-auto'
              />
              {/* <div
                        className='relative hidden sm:flex w-fit h-fit hover:scale-105 transition-transform duration-200 bg-[#FAF9F6] rounded-lg'>
                        <Input placeholder='Search...' />
                    </div> */}

              {/* <Button variant={"secondary"}> Add Account </Button> */}
            </div>
            {/*<Button variant={'secondary'}> Add Account </Button>*/}
            <AdminAdd />
          </div>

          <div className='mt-8  '>
            <Table className='bg-white text-black rounded-lg '>
              <TableHeader className='p-10'>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>ID #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(user => user.role === "STUDENT").map((user, idx) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>{idx + 1}</TableCell>
                    <TableCell>{user.idNumber}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>Online</TableCell>                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
