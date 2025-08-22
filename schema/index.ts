import * as z from 'zod';

export const SignUpSchema = z.object({
    idNumber: z.string().min(7, {
        message: "Please enter a valid ID number"
    }),
    fullName: z.string().min(1, {
        message: "Please enter your Full name"
    }),

    section: z.enum(["A", "B", "C", "D", "E"]).optional(),

    course: z.enum(["BSIT", "BSIE", "BSHM", "BTLED", "BEED"]).optional(),

    role: z.enum(["STUDENT", "ADMIN"]).optional(),

    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    })
});

export const SignInSchema = z.object({
    idNumber: z.string().min(7, {
        message: "Please enter a valid ID number"
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    })
});