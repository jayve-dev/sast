"use client";
import React, { useState } from "react";
import { CreateProgramSchema } from "../../../schema";
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

const ProgramAdd = () => {
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateProgramSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof CreateProgramSchema>) => {
    setLoading(true);
    console.log(data);

    const response = await fetch("/api/create/department/program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
          <div className='w-full'>

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. BSIT' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' className='w-full'>
            {isLoading ? "Creating..." : "Create Program"}
          </Button>
        </form>
      </Form>
  );
};

export { ProgramAdd };
