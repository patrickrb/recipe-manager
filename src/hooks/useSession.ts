"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import { usePathname } from "next/navigation";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar: string | null;
}

export function useSession() {
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
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]); // Re-fetch when route changes

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  return { user, isLoading, isAdmin, isSuperAdmin };
}
