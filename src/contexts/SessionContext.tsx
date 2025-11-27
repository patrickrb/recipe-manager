"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserRole } from "@prisma/client";
import { usePathname } from "next/navigation";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar: string | null;
}

interface SessionContextType {
  user: SessionUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const fetchSession = () => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data?.user || null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[SessionProvider] Error fetching session:', err);
        setUser(null);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]); // Re-fetch when route changes

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <SessionContext.Provider value={{ user, isLoading, isAdmin, isSuperAdmin }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
