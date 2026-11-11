import { useState } from 'react';
import { analisarNoticia } from '../api';
import Resultado from './Resultado';
import Selo from './Selo';

const LEGENDA = [
  ['Verificado', 'Consistente com fontes confiáveis.'],
  ['Falso', 'Contradiz fatos verificáveis.'],
  ['Enganoso', 'Mistura fatos reais com distorções.'],
  ['Inconclusivo', 'Sem evidência suficiente.']
];

export default function Analise({ token }) {
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;

    setCarregando(true);
    setErro('');
    setResultado(null);

    try {
      setResultado(await analisarNoticia(texto.trim(), token));
    } catch (err) {
      setErro(err instanceof TypeError ? 'Não consegui falar com o servidor. Ele está ligado?' : err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="hero">
      <p className="eyebrow-note">Projeto de Trabalho de Conclusão de Curso · 2026.2</p>
      <h1>Antes de compartilhar, <em>verifique</em>.</h1>
      <p className="hero-lede">
        Cole o texto de uma notícia. A TruthCheck AI pesquisa na web e devolve uma classificação
        clara, com justificativa e fontes.
      </p>

      <form className="analyze-card" onSubmit={enviar}>
        <label htmlFor="noticia">Texto da notícia</label>
        <textarea
          id="noticia"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Cole aqui o texto da notícia..."
          required
        />
        <div className="analyze-row">
          <span className="analyze-hint">
            {token ? 'Esta análise será salva no seu histórico.' : 'Sem login, a análise não fica no histórico.'}
          </span>
          <button type="submit" className="btn primary" disabled={carregando}>
            {carregando ? 'Analisando...' : 'Analisar notícia'}
          </button>
        </div>

        {carregando && (
          <p className="loading">Pesquisando na web e analisando... pode levar até 30 segundos.</p>
        )}
        {erro && <p className="result-copy">Não foi possível analisar: {erro}</p>}
        {resultado && <Resultado dados={resultado} />}
      </form>

      <ul className="legenda">
        {LEGENDA.map(([nome, descricao]) => (
          <li key={nome}>
            <Selo classificacao={nome} />
            <span>{descricao}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
