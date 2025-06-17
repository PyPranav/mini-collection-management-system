"use client";

import { loginUser, logout, registerUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import { useEffect } from "react";
import { client } from "@/lib/client";


export default function Home() {

  const { data, status } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch()

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [])


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      Email: {data.email} <br />
      ID: {data.id} <br />
      Is Loged In: {status}

      <button onClick={async () => {
        if (data.email) {
          dispatch(logout());
          return;
        }
        const res = await dispatch(
          registerUser({
            email: "pranav212@gmail.com",
            password: "Pranav@123",
          })
        )

      }} >test</button>

      <button onClick={()=>{
        client.get("/users/profile").then((res) => {
          console.log(res.data);
        }).catch((error) => {
          console.error("Error fetching profile:", error);
        });
      }}>
        profile
      </button>
    </div>
  );
}
