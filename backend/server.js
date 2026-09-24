const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

const instrucoes = `Você é um verificador de fatos especializado em identificar desinformação.
Analise a notícia enviada e classifique em UMA destas categorias:
- "Verificado": a informação é consistente com fatos conhecidos.
- "Falso": a informação contradiz fatos conhecidos.
- "Enganoso": mistura fatos reais com distorções, exageros ou falta de contexto.
- "Inconclusivo": não há informação suficiente para avaliar, ou o fato é recente demais.
Responda APENAS com um JSON neste formato:
{"classificacao": "...", "confianca": numero de 0 a 100, "justificativa": "explicação curta em português"}`;

app.post('/analisar-noticia', async (req, res) => {
  const { texto } = req.body;

  if (!texto || texto.trim() === '') {
    return res.status(400).json({ erro: 'Envie o texto da notícia.' });
  }

  try {
    const resposta = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instrucoes },
        { role: 'user', content: texto }
      ]
    });

    const resultado = JSON.parse(resposta.choices[0].message.content);
    console.log('Resultado:', resultado);
    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao consultar a Groq:', erro.message);
    res.status(500).json({ erro: 'Falha ao analisar a notícia.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});