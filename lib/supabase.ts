import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hhivmsvpfkogmwmeoglo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaXZtc3ZwZmtvZ213bWVvZ2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTAyNzYsImV4cCI6MjA5NTE2NjI3Nn0.SmUGJHybFqvZMQkyD6sVjijrv26vz66BIVO1XKWRonU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
