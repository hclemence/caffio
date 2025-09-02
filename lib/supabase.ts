import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_SERVICE_SUPABASE_KEY!; // server-side only

export const supabase = createClient(supabaseUrl, supabaseKey);
