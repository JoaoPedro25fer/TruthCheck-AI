import { useEffect, useState } from 'react';
import { buscarHistorico } from '../api';
import Resultado from './Resultado';
import Selo from './Selo';

export default function Historico({ token }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarHistorico(token)
      .then(setLista)
      .catch((err) => setErro(err.message));
  }, [token]);

  return (
    <section className="pagina">
      <h2>Seu histórico</h2>

      {erro && <p className="result-copy">Não foi possível carregar: {erro}</p>}
      {!erro && lista === null && <p className="loading">Carregando...</p>}
      {lista && lista.length === 0 && <p className="result-copy">Você ainda não fez nenhuma análise.</p>}

      <ul className="historico">
        {(lista || []).map((item) => (
          <li key={item.id} className="historico-item">
            <details>
              <summary>
                <Selo classificacao={item.classificacao} />
                <span className="historico-texto">{item.noticia}</span>
                <time>{new Date(item.created_at).toLocaleString('pt-BR')}</time>
              </summary>
              <Resultado dados={item} />
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
