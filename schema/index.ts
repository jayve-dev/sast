import * as z from "zod";

export const SignUpSchema = z.object({
  idNumber: z.string().min(7, {
    message: "Please enter a valid ID number",
  }),
  fullName: z.string().min(1, {
    message: "Please enter your Full name",
  }),

  role: z.enum(["STUDENT", "ADMIN"]).optional(),

  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const SignInSchema = z.object({
  idNumber: z.string().min(7, {
    message: "Please enter a valid ID number",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const CreateStudentSchema = z.object({
  idNumber: z.string().min(7, {
    message: "Please enter a valid ID number",
  }).max(7, {
    message: "ID number must be at most 7 characters long",
  }),
  fullName: z.string().min(1, {
    message: "Please enter your Full name",
  }),

  programId: z.string().uuid("Please select a valid Program"),
})

export const CreateInstructorSchema = z.object({
  facultyId: z.string().min(7, {
    message: "Please enter a valid Faculty ID",
  }),
  fullName: z.string().min(1, {
    message: "Please enter your Full name",
  }),
})

export const CreateProgramSchema = z.object({
  name: z.string().min(1, {
    message: "Please enter a valid Program Name",
  }),
})

export const CreateSectionSchema = z.object({
  name: z.string().min(1, {
    message: "Please enter a valid Section Name",
  }),
  programId: z.string().uuid("Please select a valid Program"),
})

export const CreateCourseSchema = z.object({
  name: z.string().min(1, {
    message: "Please enter a valid Course Name",
  }),
  code: z.string().min(1, {
    message: "Please enter a valid Course Code",
  }),
  programId: z.string().uuid("Please select a valid Program"),
  sectionId: z.string().uuid("Please select a valid Section"),
})
