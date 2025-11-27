import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { SessionProvider } from "@/contexts/SessionContext";

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
          <Navigation />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
