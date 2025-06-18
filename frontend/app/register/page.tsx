"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { email } from "zod/v4";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";
import LoaderButton from "@/components/custom/LoaderButton";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine((val) => /[!@#$%^&*(),.?\":{}|<>]/.test(val), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", data);
    // Handle form submission logic here
    const res = await dispatch(registerUser(data));

    if (res.meta.requestStatus === "fulfilled") {
      console.log("Login successful:", res.payload);
      localStorage.setItem("accessToken", res.payload.accessToken);
      localStorage.setItem("refreshToken", res.payload.refreshToken);
      router.push("/"); // Redirect to home page or any other page after successful registration
      // Redirect or show success message
    } else {
      console.error("Login failed:", res);
      // Show error message to the user
    }
  };

  return (
    <main className="flex w-screen h-screen bg-gray-50 justify-center items-center">
      <div className="w-[300px] flex flex-col gap-5">
        <h2 className="text-2xl text-center font-display">
          Login in or create an account to Get Started
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      className="input"
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="input"
                      placeholder="Enter your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="input"
                      placeholder="Re-enter your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <p>Already have a account?</p>
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </div>
            <LoaderButton
              className="h-fit py-3"
              isLoading={form.formState.isSubmitting}
            >
              Register
            </LoaderButton>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default RegisterPage;
