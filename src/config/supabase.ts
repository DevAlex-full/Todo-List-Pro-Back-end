import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
  throw new Error('Configuração do Supabase incompleta');
}

// Cliente Supabase com SERVICE ROLE
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

console.log('');
console.log('✅ Supabase BACKEND conectado!');
console.log('🔑 URL:', supabaseUrl);
console.log('🔐 Service Key configurada');
console.log('');