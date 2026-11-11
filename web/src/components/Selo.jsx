const CARIMBOS = {
  Verificado: { classe: 'verified', texto: 'VERIFICADO' },
  Falso: { classe: 'falso', texto: 'FALSO' },
  Enganoso: { classe: 'incerto', texto: 'ENGANOSO' },
  Inconclusivo: { classe: 'inconclusivo', texto: 'INCONCLUSIVO' }
};

export default function Selo({ classificacao }) {
  const carimbo = CARIMBOS[classificacao] || CARIMBOS.Inconclusivo;
  return <span className={`stamp-inline ${carimbo.classe}`}>{carimbo.texto}</span>;
}
