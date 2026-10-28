const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3000;

const MODELO_PESQUISA = 'openai/gpt-oss-120b';
const MODELO_RAPIDO = 'openai/gpt-oss-20b';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const REGRAS = `Classifique em UMA destas categorias:
- "Verificado": a informação é confirmada por evidências confiáveis.
- "Falso": a informação é CONTRADITA por evidências concretas.
- "Enganoso": mistura fatos reais com distorções, exageros ou falta de contexto.
- "Inconclusivo": não há evidência suficiente para confirmar nem para desmentir, OU a afirmação é ambígua demais para ser checada.

REGRA MAIS IMPORTANTE: não conhecer um fato NÃO é motivo para dizer que ele é falso.
Só use "Falso" quando existir evidência que contradiga a afirmação.
Se você não tem informação sobre o fato, use "Inconclusivo".
Nunca invente leis, regras ou competências de órgãos para justificar uma classificação.

DATAS:
- Use a data de hoje como referência para tudo.
- Sempre compare a data de cada fonte com a data de hoje. Uma fonte antiga pode falar de algo como "futuro" quando isso já aconteceu.
- Se uma fonte diz que um evento ainda vai acontecer, mas essa data já passou, procure o resultado do evento antes de classificar.
AFIRMAÇÕES AMBÍGUAS:
- Se a afirmação pode se referir a eventos diferentes (por exemplo, anos diferentes) e o resultado muda conforme o evento, NÃO escolha um deles.
- Nesse caso, classifique como "Inconclusivo" e explique na justificativa as interpretações possíveis e o resultado de cada uma, pedindo que o usuário especifique (por exemplo, o ano).

CONFIANÇA:
- Use confiança acima de 90 apenas quando houver fontes recentes e concordantes.
- Se as fontes forem antigas, poucas ou contraditórias, reduza a confiança.`;

function dataDeHoje() {
  return new Date().toLocaleDateString('pt-BR');
}

function instrucoesComPesquisa() {
  return `Você é um verificador de fatos especializado em identificar desinformação.
A data de hoje é ${dataDeHoje()}. Podem existir fatos recentes que você não conhece, por isso pesquise.

Antes de classificar, PESQUISE NA WEB sobre a afirmação enviada.
Dê preferência a fontes confiáveis: agências de checagem (Lupa, Aos Fatos, Fato ou Fake do g1, Estadão Verifica), órgãos oficiais e grandes veículos de imprensa.
Não use blogs anônimos ou redes sociais como única fonte.

${REGRAS}

Termine sua resposta com o resultado em JSON, entre as marcações <<<JSON e JSON>>>, exatamente assim:
<<<JSON
{"classificacao": "...", "confianca": numero de 0 a 100, "justificativa": "explicação curta em português", "fontes": ["https://...", "https://..."]}
JSON>>>
No campo "fontes", coloque as URLs completas das páginas que você usou, começando com https://`;
}

function instrucoesSemPesquisa() {
  return `Você é um verificador de fatos especializado em identificar desinformação.
A data de hoje é ${dataDeHoje()}. Seu conhecimento vai só até a data do seu treinamento, então fatos recentes podem ser desconhecidos para você.

${REGRAS}

Responda APENAS com um JSON neste formato:
{"classificacao": "...", "confianca": numero de 0 a 100, "justificativa": "explicação curta em português"}`;
}

function extrairResultado(textoDaIA) {
  const encontrados = [...textoDaIA.matchAll(/<<<JSON([\s\S]*?)JSON>>>/g)];

  if (encontrados.length === 0) {
    console.log('Resposta bruta da IA:', textoDaIA);
    throw new Error('A IA não devolveu o resultado no formato esperado.');
  }

  const ultimo = encontrados[encontrados.length - 1][1];
  return JSON.parse(ultimo.trim());
}

async function analisarComPesquisa(texto) {
  const resposta = await groq.chat.completions.create({
    model: MODELO_PESQUISA,
    temperature: 0.2,
    max_completion_tokens: 4096,
    reasoning_effort: 'low',
    tool_choice: 'required',
    tools: [{ type: 'browser_search' }],
    messages: [
      { role: 'system', content: instrucoesComPesquisa() },
      { role: 'user', content: texto }
    ]
  });

  console.log('Tokens usados (com pesquisa):', resposta.usage?.total_tokens);

  const resultado = extrairResultado(resposta.choices[0].message.content);
  resultado.modo = 'com-pesquisa';
  return resultado;
}

async function analisarSemPesquisa(texto) {
  const resposta = await groq.chat.completions.create({
    model: MODELO_RAPIDO,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: instrucoesSemPesquisa() },
      { role: 'user', content: texto }
    ]
  });

  console.log('Tokens usados (sem pesquisa):', resposta.usage?.total_tokens);

  const resultado = JSON.parse(resposta.choices[0].message.content);
  resultado.modo = 'sem-pesquisa';
  resultado.fontes = [];
  return resultado;
}
function numeroInteiroOuNulo(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return null;
  return Math.round(numero);
}

async function salvarAnalise(texto, resultado) {
  try {
    const { error } = await supabase
      .from('analises')
      .insert({
        noticia: texto,
        classificacao: resultado.classificacao,
        justificativa: resultado.justificativa,
        confianca: numeroInteiroOuNulo(resultado.confianca),
        modo: resultado.modo,
        fontes: Array.isArray(resultado.fontes) ? resultado.fontes : []
      });

    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
      return;
    }

    console.log('Análise salva no Supabase.');
  } catch (erro) {
    console.error('Falha inesperada ao salvar:', erro.message);
  }
}

app.post('/analisar-noticia', async (req, res) => {
  const { texto } = req.body;

  if (!texto || texto.trim() === '') {
    return res.status(400).json({ erro: 'Envie o texto da notícia.' });
  }

  try {
    const resultado = await analisarComPesquisa(texto);
    console.log('Resultado (com pesquisa):', resultado);
    await salvarAnalise(texto, resultado); // ← NOVO
    return res.json(resultado);
  } catch (erroPesquisa) {
    console.warn('Pesquisa falhou, usando plano B:', erroPesquisa.message);
  }

  try {
    const resultado = await analisarSemPesquisa(texto);
    console.log('Resultado (plano B):', resultado);
    await salvarAnalise(texto, resultado); // ← NOVO
    return res.json(resultado);
  } catch (erro) {
    console.error('Plano B também falhou:', erro.message);
    return res.status(500).json({ erro: 'Falha ao analisar a notícia.' });
  }
});

app.listen(PORT, (erro) => {
  if (erro) {
    console.error('Não foi possível ligar o servidor:', erro.message);
    return;
  }
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});