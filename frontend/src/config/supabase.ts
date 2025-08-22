import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmgitjcfgyhbkqiqkppi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2l0amNmZ3loYmtxaXFrcHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4Nzg4MzcsImV4cCI6MjA3MTQ1NDgzN30.yMtxtrhuwkej-sG3zN6yECaYZMJgFxN5iHN3dh97YRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
