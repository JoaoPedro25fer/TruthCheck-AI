import Selo from './Selo';

export default function Resultado({ dados }) {
  const fontes = (dados.fontes || []).filter((url) => /^https?:\/\//.test(url));

  return (
    <div className="resultado">
      <Selo classificacao={dados.classificacao} />
      <p className="result-copy">{dados.justificativa}</p>

      {fontes.length > 0 && (
        <>
          <p className="result-disclaimer">Fontes consultadas:</p>
          <ul className="result-disclaimer">
            {fontes.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {dados.modo === 'sem-pesquisa' && (
        <p className="result-disclaimer">
          Atenção: esta análise foi feita sem pesquisa na web. Notícias recentes podem não ser reconhecidas.
        </p>
      )}

      {dados.confianca != null && (
        <p className="result-disclaimer">
          Confiança da IA: {dados.confianca}%. Resultado gerado por inteligência artificial, confira sempre as fontes.
        </p>
      )}
    </div>
  );
}
