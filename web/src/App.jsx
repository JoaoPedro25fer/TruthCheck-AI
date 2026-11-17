import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import Analise from './components/Analise';
import Historico from './components/Historico';
import Login from './components/Login';
import Painel from './components/Painel';
import { buscarPerfil } from './api';

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('analisar');
  const [admin, setAdmin] = useState(false);

  const token = sessao ? sessao.access_token : null;

  // Pergunta ao servidor se quem entrou é administrador (decide se mostra a aba Painel).
  useEffect(() => {
    if (!token) {
      setAdmin(false);
      return;
    }
    buscarPerfil(token)
      .then((perfil) => setAdmin(perfil.admin))
      .catch(() => setAdmin(false));
  }, [token]);

  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <p className="wrap aviso">
        Falta configurar o arquivo web/.env com a chave pública do Supabase (veja web/.env.example).
      </p>
    );
  }
  if (carregando) return null;

  async function sair() {
    await supabase.auth.signOut();
    setAba('analisar');
  }

  return (
    <>
      <header className="site">
        <div className="wrap nameplate">
          <span className="brand mark">
            Truth<em>Check</em> AI
          </span>
          <nav className="primary">
            <button className={aba === 'analisar' ? 'ativo' : ''} onClick={() => setAba('analisar')}>
              Analisar
            </button>
            <button className={aba === 'historico' ? 'ativo' : ''} onClick={() => setAba('historico')}>
              Histórico
            </button>
            {admin && (
              <button className={aba === 'painel' ? 'ativo' : ''} onClick={() => setAba('painel')}>
                Painel
              </button>
            )}
            {sessao ? (
              <>
                <span className="usuario">{sessao.user.email}</span>
                <button className="btn" onClick={sair}>Sair</button>
              </>
            ) : (
              <button className="btn" onClick={() => setAba('login')}>Entrar</button>
            )}
          </nav>
        </div>
      </header>

      <main className="wrap">
        {aba === 'analisar' && <Analise token={token} />}
        {aba === 'historico' &&
          (sessao ? <Historico token={token} /> : <Login aviso="Entre para ver o seu histórico." />)}
        {aba === 'painel' && admin && <Painel token={token} />}
        {aba === 'login' && <Login aoEntrar={() => setAba('analisar')} />}
      </main>

      <footer className="site">
        <div className="wrap">
          <p>© 2026 TruthCheck AI — João Pedro Fernandes e Luiz Tonny Moura Santos.</p>
        </div>
      </footer>
    </>
  );
}
