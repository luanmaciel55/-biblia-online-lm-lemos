import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://netzyacozeuxmngshpqi.supabase.co";
const supabasePublishableKey = "sb_publishable_uoKSNuxOzBagB5iaIJCP8w_yWrzSG5w";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
