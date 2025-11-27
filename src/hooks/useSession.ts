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
        console.log('[useSession] Session data:', data);
        console.log('[useSession] User role:', data?.user?.role);
        setUser(data?.user || null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[useSession] Error fetching session:', err);
        setUser(null);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]); // Re-fetch when route changes

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  console.log('[useSession] isAdmin:', isAdmin, 'user role:', user?.role);

  return { user, isLoading, isAdmin, isSuperAdmin };
}
