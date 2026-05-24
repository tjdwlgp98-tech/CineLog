import { createClient } from "@supabase/supabase-js";

// Hermes (RN 0.71+) has crypto built-in, but polyfill just in case
if (typeof global.crypto === "undefined") {
  (global as any).crypto = {};
}
if (typeof global.crypto.getRandomValues === "undefined") {
  (global as any).crypto.getRandomValues = (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

const SUPABASE_URL = "https://hhivmsvpfkogmwmeoglo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaXZtc3ZwZmtvZ213bWVvZ2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1OTAyNzYsImV4cCI6MjA5NTE2NjI3Nn0.SmUGJHybFqvZMQkyD6sVjijrv26vz66BIVO1XKWRonU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
