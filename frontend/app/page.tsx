"use client";

import {
  getCurrentUser,
  loginUser,
  logout,
  registerUser,
} from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import { useEffect } from "react";
import { client } from "@/lib/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data, status } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(getCurrentUser()).then((res) => {
      if (res.meta.requestStatus !== "fulfilled") {
        toast.error("User not logged in");
        router.push("/login");
      }
    });
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      Email: {data.email} <br />
      ID: {data.id} <br />
      Is Loged In: {status}
      <button
        onClick={async () => {
          if (data.email) {
            dispatch(logout());
            return;
          }
          const res = await dispatch(
            registerUser({
              email: "pranav212@gmail.com",
              password: "Pranav@123",
            })
          );
        }}
      >
        test
      </button>
      <button
        onClick={() => {
          dispatch(getCurrentUser());
        }}
      >
        profile
      </button>
    </div>
  );
}
