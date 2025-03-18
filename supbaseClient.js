const { createClient } = require("@supabase/supabase-js");

// Your Supabase project URL and API key
const supabaseUrl = "";
const supabaseKey = "";
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
