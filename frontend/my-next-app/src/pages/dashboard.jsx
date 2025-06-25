import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";
import useUser from "@/lib/useUser";
import JobForm from "@/components/JobForm";

export default function Dashboard() {
const { user, loading } = useUser();


  return (
    <>
      <Navbar user={user} loading={loading} />
      <main style={{ padding: "2rem", color: "#fff" }}>

      <JobForm></JobForm>
        
      </main>
    </>
  );
}
