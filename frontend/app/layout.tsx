import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import NotificationListener from "@/components/custom/NotificationListener";

export const metadata: Metadata = {
  title: "Mini Collection Management System",
  description: "Mini Collection Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
          <NotificationListener />
        </StoreProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
