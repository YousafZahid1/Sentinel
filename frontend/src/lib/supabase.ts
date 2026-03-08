import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://phxzeycrmkdpvegztaib.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoeHpleWNybWtkcHZlZ3p0YWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjMwMTUsImV4cCI6MjA4ODQzOTAxNX0.VL5Ivba37Y14xPOj6GH0x_WLFIwMakKk3i65GrB9jo0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
