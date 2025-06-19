"use client"
import CustomerTable from "@/components/custom/customerTable/CustomerTable";
import { useAppDispatch } from "@/store/hooks";
import { getCurrentUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const Home = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  useEffect(() => {
    (async () => {
        const res = await dispatch(getCurrentUser())
        if (!res.payload) {
          toast.error("Please login to continue")
          router.push("/login")
        }
    })()
  }, [dispatch])
  return <CustomerTable />;
};

export default Home;
