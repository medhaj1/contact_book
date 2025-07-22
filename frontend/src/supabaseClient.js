import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzutkwvutfjaimwuobdu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dXRrd3Z1dGZqYWltd3VvYmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjU3MDMsImV4cCI6MjA2ODMwMTcwM30.IPZZ5v_yNwzbzOhPu7i4qMxr0YPK7qxFEhsUgf_v7S4'; 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
