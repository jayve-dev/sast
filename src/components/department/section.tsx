"use client";
import React, { useState, useEffect } from "react";
import { CreateSectionSchema } from "../../../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { z } from "zod";

const SectionAdd = () => {
  const [isLoading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateSectionSchema),
    defaultValues: {
      name: "",
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

  const onSubmit = async (data: z.infer<typeof CreateSectionSchema>) => {
    setLoading(true);
    console.log(data);

    const payload = {
      ...data,
      programId: data.programId,
    }

    const response = await fetch("/api/create/department/section", {
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
    console.log("Account created successfully:", resData);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='w-full flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='e.g. 1A' />
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
                  <select {...field} className='w-full border rounded p-2'>
                    <option value=''>Select Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full'>
          {isLoading ? "Creating..." : "Create Section"}
        </Button>
      </form>
    </Form>
  );
};

export { SectionAdd };
