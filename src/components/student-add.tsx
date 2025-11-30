"use client";
import React, { useState, useEffect } from "react";
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
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      sectionId: "",
      programId: "",
    },
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      const res = await fetch("/api/create/department/program");
      const data = await res.json();
      setPrograms(data);
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const res = await fetch("/api/create/department/section");
      const data = await res.json();
      setSections(data);
    };
    fetchSections();
  }, []);

  const onSubmit = async (data: z.infer<typeof CreateStudentSchema>) => {
    setLoading(true);

    const payload = {
      ...data,
      idNumber: Number(data.idNumber),
    };

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
              name='programId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='w-full p-2 border rounded'
                      defaultValue=''
                    >
                      <option value='' disabled>
                        Select Program
                      </option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sectionId'
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
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
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
    </>
  );
};

export { StudentAdd };
