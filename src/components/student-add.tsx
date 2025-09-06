"use client";
import React, { useState } from "react";
import { AddModal } from "./ui/add-modal";
import { CreateStudentSchema } from "../../schema";
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

const StudentAdd = () => {
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      section: undefined,
      course: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof CreateStudentSchema>) => {
    setLoading(true);
    // console.log(data);

    // Convert idNumber to a number before sending
    const payload = {
      ...data,
      idNumber: Number(data.idNumber),
    };

    // Remove confirmPassword before sending to backend
    // delete payload.confirmPassword;

    const response = await fetch("/api/create/student", {
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
    console.log("Student created successfully:", resData);
    form.reset();
    alert("Student created successfully!");
  };

  return (
    <>
      <AddModal title='Add Student' triggerText='Add Student'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='w-full grid sm:grid-cols-2 gap-4'>
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
                      <Input {...field} placeholder='Jerold Elson Monleon' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='course'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className='w-full p-2 border rounded'
                        defaultValue=''
                      >
                        <option value='' disabled>
                          Select Course
                        </option>
                        <option value='BSIT'>BSIT</option>
                        <option value='BSIE'>BSIE</option>
                        <option value='BSHM'>BSHM</option>
                        <option value='BTLED'>BTLED</option>
                        <option value='BEED'>BEED</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='section'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className='w-full p-2 border rounded'
                        defaultValue=''
                      >
                        <option value='' disabled>
                          Select Section
                        </option>
                        <option value='A'>A</option>
                        <option value='B'>B</option>
                        <option value='C'>C</option>
                        <option value='D'>D</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? "Loading..." : "ADD"}
            </Button>
          </form>
        </Form>
      </AddModal>
    </>
  );
};

export { StudentAdd };
