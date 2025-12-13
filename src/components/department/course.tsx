"use client";
import React, { useState, useEffect } from "react";
import { CreateCourseSchema } from "../../../schema";
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

interface Program {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  programId: string;
}

const CourseAdd = () => {
  const [isLoading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      name: "",
      code: "",
      programId: "",
      sectionId: "",
    },
  });

  const selectedProgramId = form.watch("programId");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch("/api/create/department/program");
        const data = await res.json();
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/create/department/section");
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setSections([]);
      }
    };
    fetchSections();
  }, []);

  // Filter sections based on selected program
  useEffect(() => {
    if (selectedProgramId) {
      const filtered = sections.filter(
        (section) => section.programId === selectedProgramId
      );
      setFilteredSections(filtered);

      // Reset section selection if current selection is not in filtered list
      const currentSectionId = form.getValues("sectionId");
      if (
        currentSectionId &&
        !filtered.some((s) => s.id === currentSectionId)
      ) {
        form.setValue("sectionId", "");
      }
    } else {
      setFilteredSections([]);
      form.setValue("sectionId", "");
    }
  }, [selectedProgramId, sections, form]);

  const onSubmit = async (data: z.infer<typeof CreateCourseSchema>) => {
    setLoading(true);
    console.log(data);

    const payload = {
      ...data,
      programId: data.programId,
      sectionId: data.sectionId,
    };

    try {
      const response = await fetch("/api/create/department/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error("Error creating course:", resData.message);
        setLoading(false);
        return;
      }

      console.log("Course created successfully:", resData);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='w-full flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='e.g. PC 212' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='e.g. Data structure and algorithm'
                  />
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
                    className='w-full border rounded p-2 bg-background'
                  >
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

          <FormField
            control={form.control}
            name='sectionId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={
                      !selectedProgramId || filteredSections.length === 0
                    }
                    className='w-full border rounded p-2 bg-background disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <option value=''>
                      {!selectedProgramId
                        ? "Select a program first"
                        : filteredSections.length === 0
                        ? "No sections available for this program"
                        : "Select Section"}
                    </option>
                    {filteredSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
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
          {isLoading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </Form>
  );
};

export { CourseAdd };
