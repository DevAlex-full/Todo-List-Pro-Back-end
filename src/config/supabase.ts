import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias no arquivo .env'
  );
}

// Cliente Supabase com Service Role (para operações do backend)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cliente para operações de autenticação
export const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);

console.log('✅ Supabase conectado com sucesso!');
