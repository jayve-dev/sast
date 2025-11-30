"use client";
import React, { useState } from "react";
import { AddModal } from "./ui/add-modal";
import { CreateInstructorSchema } from "../../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const InstructorAdd = () => {
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateInstructorSchema),
    defaultValues: {
      facultyId: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof CreateInstructorSchema>) => {
    setLoading(true);
    // console.log(data);

    // Convert idNumber to a number before sending
    const payload = {
      ...data,
      facultyId: Number(data.facultyId),
    };

    // Remove confirmPassword before sending to backend
    // delete payload.confirmPassword;

    const response = await fetch("/api/create/instructor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    if (!response.ok) {
      console.error("Error creating account:", resData.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    console.log("Instructor created successfully:", resData);
    form.reset();
    alert("Instructor created successfully!");
  };

  return (
    <div>
      <AddModal title='Add Instructor' triggerText='Add Instructor'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='w-full grid sm:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='facultyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='1234567'
                        className='w-full'
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
                      <Input {...field} placeholder='Prof. John Doe' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? "Loading..." : "ADD INSTRUCTOR"}
            </Button>
          </form>
        </Form>
      </AddModal>
    </div>
  );
};

export { InstructorAdd };
