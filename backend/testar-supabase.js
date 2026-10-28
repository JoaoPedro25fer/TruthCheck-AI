const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function testar() {
  try {
    const { data, error } = await supabase
      .from('analises')
      .select('id, created_at, classificacao')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.log('ERRO ao falar com o Supabase:', error.message);
      return;
    }

    console.log('Supabase ATIVO! Ultimas analises:');
    console.table(data);
  } catch (erro) {
    console.log('FALHA de conexao:', erro.message);
  }
}

testar();