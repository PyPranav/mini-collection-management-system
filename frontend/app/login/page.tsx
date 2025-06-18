"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import LoaderButton from "@/components/custom/LoaderButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted with data:", data);

    const res = await dispatch(loginUser(data));
    console.log("Login response:", res);
    if (res.meta.requestStatus === "fulfilled") {
      console.log("Login successful:", res.payload);
      localStorage.setItem("accessToken", res.payload.accessToken);
      localStorage.setItem("refreshToken", res.payload.refreshToken);
      toast.success("Login successful!");
      router.push("/");
    } else {
      console.error("Login failed:");
      toast.error("Login failed. Please check your credentials.");
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
            <div className="flex gap-2">
              <p>Dont have a account?</p>
              <Link href="/register" className="text-blue-500 hover:underline">
                Register
              </Link>
            </div>

            <LoaderButton
              className="h-fit py-3"
              isLoading={form.formState.isSubmitting}
            >
              Login
            </LoaderButton>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default LoginPage;
