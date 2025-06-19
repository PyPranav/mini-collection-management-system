"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "@/store/hooks";
import { fetchNotifications } from "@/store/slices/notificationsSlice";
import { getCustomersWithCurrentFilters } from "@/store/slices/customerSlice";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

const NotificationListener = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    // Listen for all events
    const allEvents = (event: string, ...args: any[]) => {
      if (!localStorage.getItem("accessToken")) {
        return;
      }
      toast.info(`${event}: ${JSON.stringify(args[0])}`);
      setTimeout(() => {
        dispatch(fetchNotifications( new Date().toISOString() as any) as any);
        dispatch(getCustomersWithCurrentFilters() as any)
      }, 1000);
    };
    // @ts-ignore
    socket.onAny(allEvents);

    return () => {
      if (socket) {
        // @ts-ignore
        socket.offAny(allEvents);
        socket.disconnect();
      }
    };
  }, []);

  return null;
};

export default NotificationListener; 