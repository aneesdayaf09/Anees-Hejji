import { createClient } from '@supabase/supabase-js';

// Fix for TypeScript "Cannot find name 'process'" error
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are present
export const isCloudEnabled = !!(supabaseUrl && supabaseAnonKey);

let supabase: any = null;

if (isCloudEnabled) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    console.log("Supabase initialized: Cloud Sync Active");
  } catch (error) {
    console.error("Supabase init failed:", error);
  }
} else {
  console.log("Supabase keys missing: Running in Local Mode (No Sync)");
}

export { supabase };