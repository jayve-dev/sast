"use client";
import React, { useState } from "react";
import CardWrapper from "./CardWrapper";
import { SignUpSchema } from "../../../../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
// import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
// import { useRouter } from "next/navigation";

const SignUpForm = () => {
//   const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      section: undefined,
      course: undefined,
      role: "STUDENT",
      password: "",
      confirmPassword: "",
    },
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    setLoading(true);
    console.log(data);
    if (data.password !== data.confirmPassword) {
      console.error("Passwords do not match.");
      return;
    }

    // Convert idNumber to a number before sending
    const payload = {
      ...data,
      idNumber: Number(data.idNumber),
    };

    // Remove confirmPassword before sending to backend
    // delete payload.confirmPassword;

    const response = await fetch("/api/create/user", {
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
    alert("Account created successfully!");
  };

  return (
    <CardWrapper
      label='Create an account'
      title='Welcome'
      backButtonHref='/signin'
      backButtonLabel='Already have an account? Sign in'
      className='sm:w-[500px]'
    >
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
                    <Input {...field} placeholder='Jeboy Gwaponalang' />
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
                      <option value='E'>E</option>
                    </select>
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
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={isShowPassword ? "text" : "password"}
                        placeholder='********'
                      />
                      <button
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={(e) => {
                          e.preventDefault();
                          setIsShowPassword(!isShowPassword);
                        }}
                      >
                        {!isShowPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={isShowConfirmPassword ? "text" : "password"}
                        placeholder='********'
                      />
                      <button
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={(e) => {
                          e.preventDefault();
                          setIsShowConfirmPassword(!isShowConfirmPassword);
                        }}
                      >
                        {!isShowConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' className='w-full'>
            { isLoading ? "Loading..." : "Sign Up"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export { SignUpForm };
