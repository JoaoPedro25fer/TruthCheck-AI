// Testes automáticos do back-end do TruthCheck AI.
// Usa só o que já vem no Node (node:test e node:assert): nenhum pacote novo.
// A Groq e o Supabase são SIMULADOS (mock): os testes não gastam tokens,
// não precisam de internet e não gravam nada no banco.

// Valores falsos, só para o createClient do Supabase não reclamar.
// O dotenv não sobrescreve variáveis que já existem, então o .env real não é usado aqui.
process.env.SUPABASE_URL = 'http://supabase-falso.local';
process.env.SUPABASE_SECRET_KEY = 'chave-falsa';
process.env.GROQ_API_KEY = 'chave-falsa';

const { test, describe, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { app, groq, supabase, extrairResultado } = require('./server');

let servidor;
let url;
let linhasGravadas;

before(async () => {
  // Porta 0 = o sistema escolhe uma porta livre.
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  url = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

beforeEach(() => {
  mock.restoreAll();
  linhasGravadas = [];

  // Supabase simulado: guarda o que seria gravado na tabela "analises".
  mock.method(supabase, 'from', () => ({
    insert: async (linha) => {
      linhasGravadas.push(linha);
      return { error: null };
    }
  }));

  // Esconde os console.log do servidor para a saída dos testes ficar limpa.
  mock.method(console, 'log', () => {});
  mock.method(console, 'warn', () => {});
  mock.method(console, 'error', () => {});
});

function respostaDaGroq(conteudo) {
  return { choices: [{ message: { content: conteudo } }], usage: { total_tokens: 100 } };
}

function analisar(texto) {
  return fetch(`${url}/analisar-noticia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto })
  });
}

describe('extrairResultado', () => {
  test('pega o JSON do ÚLTIMO bloco <<<JSON ... JSON>>>', () => {
    const texto = `Pesquisei e encontrei...
<<<JSON
{"classificacao": "Falso", "confianca": 40}
JSON>>>
Revisando a resposta:
<<<JSON
{"classificacao": "Verificado", "confianca": 95, "justificativa": "ok", "fontes": []}
JSON>>>`;

    const resultado = extrairResultado(texto);
    assert.equal(resultado.classificacao, 'Verificado');
    assert.equal(resultado.confianca, 95);
  });

  test('lança erro quando a IA não usa as marcações', () => {
    assert.throws(
      () => extrairResultado('{"classificacao": "Falso"}'),
      /formato esperado/
    );
  });
});

describe('POST /analisar-noticia', () => {
  test('devolve 400 quando o texto vem vazio', async () => {
    const chamadaGroq = mock.method(groq.chat.completions, 'create', async () => {
      throw new Error('não deveria chamar a IA');
    });

    const resposta = await analisar('   ');

    assert.equal(resposta.status, 400);
    assert.equal(chamadaGroq.mock.callCount(), 0);
  });

  test('caminho principal: usa o modelo com pesquisa e grava no Supabase', async () => {
    const chamadaGroq = mock.method(groq.chat.completions, 'create', async () =>
      respostaDaGroq(`<<<JSON
{"classificacao": "Falso", "confianca": 88, "justificativa": "Desmentido pela Lupa.", "fontes": ["https://lupa.uol.com.br/x"]}
JSON>>>`)
    );

    const resposta = await analisar('A Terra é plana.');
    const corpo = await resposta.json();

    assert.equal(resposta.status, 200);
    assert.equal(corpo.classificacao, 'Falso');
    assert.equal(corpo.modo, 'com-pesquisa');
    assert.deepEqual(corpo.fontes, ['https://lupa.uol.com.br/x']);

    assert.equal(chamadaGroq.mock.callCount(), 1);
    const pedido = chamadaGroq.mock.calls[0].arguments[0];
    assert.equal(pedido.model, 'openai/gpt-oss-120b');
    assert.deepEqual(pedido.tools, [{ type: 'browser_search' }]);

    assert.equal(linhasGravadas.length, 1);
    assert.equal(linhasGravadas[0].noticia, 'A Terra é plana.');
    assert.equal(linhasGravadas[0].user_id, null); // usuário anônimo
  });

  test('plano B: se a pesquisa falhar, usa o modelo rápido sem pesquisa', async () => {
    const chamadaGroq = mock.method(groq.chat.completions, 'create', async (pedido) => {
      if (pedido.model === 'openai/gpt-oss-120b') throw new Error('browser_search fora do ar');
      return respostaDaGroq('{"classificacao": "Inconclusivo", "confianca": 50.7, "justificativa": "Sem dados."}');
    });

    const resposta = await analisar('Choveu ontem em Passos.');
    const corpo = await resposta.json();

    assert.equal(resposta.status, 200);
    assert.equal(corpo.classificacao, 'Inconclusivo');
    assert.equal(corpo.modo, 'sem-pesquisa');
    assert.deepEqual(corpo.fontes, []);
    assert.equal(chamadaGroq.mock.callCount(), 2);

    // A confiança é arredondada antes de ir para a coluna int4.
    assert.equal(linhasGravadas[0].confianca, 51);
  });

  test('devolve 500 quando os dois modelos falham, sem gravar nada', async () => {
    mock.method(groq.chat.completions, 'create', async () => {
      throw new Error('Groq fora do ar');
    });

    const resposta = await analisar('Qualquer notícia.');

    assert.equal(resposta.status, 500);
    assert.equal(linhasGravadas.length, 0);
  });
});

describe('GET /historico', () => {
  test('devolve 401 sem login', async () => {
    const resposta = await fetch(`${url}/historico`);
    assert.equal(resposta.status, 401);
  });
});
