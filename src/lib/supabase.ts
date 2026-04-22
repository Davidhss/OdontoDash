import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL e chave não configuradas. Verifique o .env');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || ''
);
