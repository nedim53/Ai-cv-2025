import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    const authUser = session.user;

    let { data: userData, error } = await supabase
      .from("users")
      .select("id, name, surname, role, telephone, email, cv_url")
      .eq("auth_id", authUser.id)
      .maybeSingle();

    if (!userData) {
      const fallbackUser = {
        auth_id: authUser.id,
        email: authUser.email,
        name: "",
        surname: "",
        role: "user",
        telephone: "",
        cv_url: null,
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert([fallbackUser]);

      if (insertError) {
        console.error("Greška pri automatskom unosu korisnika:", insertError.message);
        setLoading(false);
        return;
      }

      userData = fallbackUser;
    }

    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser(); 
    });

    return () => {
      listener?.subscription?.unsubscribe(); 
    };
  }, []);

  return { user, loading };
}
