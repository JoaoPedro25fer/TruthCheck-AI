import { useEffect, useState } from 'react';
import { buscarMetricas } from '../api';
import Selo from './Selo';

const SELOS = ['Verificado', 'Falso', 'Enganoso', 'Inconclusivo'];

// "2026-11-16" -> "16/11" (corta o texto, sem criar Date, para não mexer no fuso).
function formatarDia(dia) {
  const [, mes, d] = dia.split('-');
  return `${d}/${mes}`;
}

function porcentagem(parte, total) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export default function Painel({ token }) {
  const [metricas, setMetricas] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarMetricas(token)
      .then(setMetricas)
      .catch((err) => setErro(err.message));
  }, [token]);

  if (erro) {
    return (
      <section className="pagina">
        <h2>Painel administrativo</h2>
        <p className="result-copy">Não foi possível carregar: {erro}</p>
      </section>
    );
  }
  if (!metricas) {
    return (
      <section className="pagina">
        <h2>Painel administrativo</h2>
        <p className="loading">Carregando...</p>
      </section>
    );
  }

  const maiorDia = Math.max(1, ...metricas.porDia.map((d) => d.total));
  const comPesquisa = metricas.porModo['com-pesquisa'];
  const semPesquisa = metricas.porModo['sem-pesquisa'];

  return (
    <section className="pagina">
      <h2>Painel administrativo</h2>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-valor">{metricas.total}</span>
          <span className="kpi-rotulo">análises no total</span>
        </div>
        <div className="kpi">
          <span className="kpi-valor">
            {metricas.confiancaMedia === null ? '—' : `${metricas.confiancaMedia}%`}
          </span>
          <span className="kpi-rotulo">confiança média</span>
        </div>
        <div className="kpi">
          <span className="kpi-valor">{porcentagem(comPesquisa, comPesquisa + semPesquisa)}%</span>
          <span className="kpi-rotulo">com pesquisa na web</span>
        </div>
      </div>

      <h3 className="painel-titulo">Análises por selo</h3>
      <ul className="barras">
        {SELOS.map((selo) => {
          const quantidade = metricas.porSelo[selo];
          return (
            <li key={selo} className="barra-linha">
              <span className="barra-rotulo">
                <Selo classificacao={selo} />
              </span>
              <span className="barra-trilho">
                <span
                  className={`barra-preenchimento selo-${selo.toLowerCase()}`}
                  style={{ width: `${porcentagem(quantidade, metricas.total)}%` }}
                />
              </span>
              <span className="barra-valor">
                {quantidade} <small>({porcentagem(quantidade, metricas.total)}%)</small>
              </span>
            </li>
          );
        })}
      </ul>

      <h3 className="painel-titulo">Análises por dia (últimos {metricas.porDia.length} dias)</h3>
      <div className="colunas" role="img" aria-label="Gráfico de análises por dia">
        {metricas.porDia.map((d) => (
          <div key={d.dia} className="coluna" title={`${formatarDia(d.dia)}: ${d.total} análise(s)`}>
            <span className="coluna-valor">{d.total}</span>
            <span className="coluna-barra" style={{ height: `${(d.total / maiorDia) * 100}%` }} />
            <span className="coluna-dia">{formatarDia(d.dia)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
