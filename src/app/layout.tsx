import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SessionProvider } from "@/contexts/SessionContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "Beautiful cross-platform recipe management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <Navigation />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
