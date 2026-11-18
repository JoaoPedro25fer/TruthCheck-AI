import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Chave pública (publishable), a mesma do site. A secreta nunca vai para o app.
// O AsyncStorage guarda a sessão no celular, para o login continuar depois de fechar o app.
export const supabase =
  url && chave
    ? createClient(url, chave, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      })
    : null;
