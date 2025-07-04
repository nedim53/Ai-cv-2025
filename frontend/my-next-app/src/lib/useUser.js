import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return setLoading(false);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const { data: userData } = await supabase
        .from("users")
        .select("name, surname, role,cv_url")
        .eq("id", authUser.id)
        .single();

      setUser({ ...authUser, ...userData });
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { user, loading };
}
