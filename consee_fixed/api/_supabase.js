const { createClient } = require("@supabase/supabase-js");

// Vercel serverless functions read env vars from Project Settings -> Environment Variables.
// Required:
//   SUPABASE_URL
//   SUPABASE_ANON_KEY

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = { getSupabase };
