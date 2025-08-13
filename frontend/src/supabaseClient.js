import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://igfgjjwlastnmrmmxpsg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnZmdqandsYXN0bm1ybW14cHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4OTk5NTgsImV4cCI6MjA2ODQ3NTk1OH0.C-9xApP2a89l5WVUkUy0O7-53gWv1OtDhoend68YpOg";
export const supabase = createClient(supabaseUrl, supabaseKey);
