"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type UserRole = "admin" | "moderator" | "customer";

export interface UserWithRole {
  user: User;
  role: UserRole;
}

export function useUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserWithRole | null> => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return null;
      }

      // Fetch role from the roles table
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      // If no role found, default to customer
      const role = (roleData?.role as UserRole) || "customer";

      return {
        user,
        role,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
