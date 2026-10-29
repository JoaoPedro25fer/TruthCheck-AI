# TruthCheck AI

Plataforma de verificação de notícias com inteligência artificial. Projeto de TCC do curso de Ciência da Computação da Unifran (2026).

O usuário envia o texto (ou o link) de uma notícia e recebe, em segundos, uma avaliação da veracidade com justificativa, nível de confiança e as fontes consultadas.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLM-F55036)

## O problema

Notícias falsas se espalham mais rápido do que é possível checá-las manualmente. O TruthCheck usa um modelo de linguagem com pesquisa na web para fazer uma primeira checagem rápida, explicando o motivo da classificação e mostrando de onde a informação veio.

## Como funciona

```mermaid
flowchart LR
    A[Front-end] -->|POST /analisar-noticia| B[API Node.js + Express]
    B --> C{Groq}
    C -->|principal| D[gpt-oss-120b + pesquisa na web]
    C -->|reserva| E[gpt-oss-20b sem pesquisa]
    B -->|grava a análise| F[(Supabase / PostgreSQL)]
    B -->|resposta| A
```

1. O usuário cola o texto ou o link da notícia no front-end.
2. O front-end chama `POST /analisar-noticia` na API.
3. A API consulta o modelo `openai/gpt-oss-120b` na Groq com pesquisa na web. Se ele falhar, usa o `openai/gpt-oss-20b` sem pesquisa (modo reserva).
4. A resposta traz a classificação (selo), a justificativa, o nível de confiança, o modo usado e as fontes.
5. Cada análise é gravada na tabela `analises` do Supabase.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Back-end | Node.js, Express |
| IA | Groq SDK (`openai/gpt-oss-120b` com `browser_search`, `openai/gpt-oss-20b` como reserva) |
| Banco de dados | Supabase (PostgreSQL) |
| Front-end | HTML, CSS e JavaScript (protótipo); React em desenvolvimento |
| Mobile | React Native com Expo (planejado) |

## Funcionalidades

- [x] Classificação da notícia por IA
- [x] Justificativa da classificação
- [x] Nível de confiança e fontes consultadas
- [x] Gravação das análises no Supabase
- [ ] Envio por URL (em testes)
- [ ] Cadastro e login (Supabase Auth)
- [ ] Histórico de análises por usuário
- [ ] Dashboard administrativo com métricas
- [ ] Versão web em React e app mobile em React Native

## Como rodar localmente

Pré-requisitos: Node.js instalado, uma chave da [Groq](https://console.groq.com) e um projeto no [Supabase](https://supabase.com).

```bash
git clone https://github.com/JoaoPedro25fer/TruthCheck-AI.git
cd TruthCheck-AI/backend
npm install
```

Crie o arquivo `backend/.env` a partir do `backend/.env.example`:

```
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

Inicie a API (porta 3000):

```bash
node server.js
```

Depois abra `frontend/index.html` com a extensão Live Server do VS Code.

## Estrutura

```
TruthCheck-AI/
├── backend/     # API Node.js + Express (server.js)
└── frontend/    # Protótipo da interface (index.html)
```

## Capturas de tela

<!-- Adicione aqui prints da tela de análise ou um GIF do uso -->

## Contato

João Pedro Fernandes — [GitHub](https://github.com/JoaoPedro25fer) · [LinkedIn](https://www.linkedin.com/in/joao-pedro-fernandes-a432b5212)
