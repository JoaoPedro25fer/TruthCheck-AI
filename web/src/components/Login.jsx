import { useState } from 'react';
import { supabase } from '../supabase';

function traduzir(mensagem) {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (mensagem.includes('already registered')) return 'Este e-mail já está cadastrado.';
  if (mensagem.includes('at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return mensagem;
}

export default function Login({ aviso, aoEntrar }) {
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [info, setInfo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setInfo('');
    setEnviando(true);

    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({ email, password: senha });

    setEnviando(false);

    if (error) {
      setErro(traduzir(error.message));
      return;
    }
    if (modo === 'cadastrar' && !data.session) {
      setInfo('Cadastro feito. Confirme o seu e-mail para entrar.');
      return;
    }
    if (aoEntrar) aoEntrar();
  }

  return (
    <section className="pagina">
      <form className="analyze-card login-card" onSubmit={enviar}>
        <h2>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h2>
        {aviso && <p className="result-copy">{aviso}</p>}

        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          minLength={6}
          required
        />

        {erro && <p className="erro">{erro}</p>}
        {info && <p className="result-copy">{info}</p>}

        <div className="analyze-row">
          <button type="button" className="link" onClick={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}>
            {modo === 'entrar' ? 'Não tenho conta' : 'Já tenho conta'}
          </button>
          <button type="submit" className="btn primary" disabled={enviando}>
            {modo === 'entrar' ? 'Entrar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </section>
  );
}
