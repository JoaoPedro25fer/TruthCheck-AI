# TruthCheck AI — instruções para o Claude Code

## Sobre o projeto
- TCC de Ciência da Computação: plataforma de detecção de fake news.
- Autores: João Pedro e Luiz Tonny Moura Santos.
- Prazo do TCC: 25/11/2026.

## Stack
- Backend: Node.js + Express (CommonJS, `require`). Arquivo principal: `backend/server.js`, porta 3000.
- IA: Groq SDK. Modelo principal `openai/gpt-oss-120b` com `browser_search`; plano B `openai/gpt-oss-20b` sem pesquisa.
- Banco: Supabase (`@supabase/supabase-js`). Tabela `analises`: id, created_at, noticia, classificacao, justificativa (text), confianca (int4), modo (text), fontes (text[]).
- Frontend: `frontend/index.html` (HTML/CSS/JS puro, aberto com Live Server), chama `POST /analisar-noticia`.
- Variáveis em `backend/.env`: GROQ_API_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY.
- Git: repositório GitHub `TruthCheck-AI`, branch `main`.
- Ambiente: Windows, PowerShell, VS Code em português, pasta dentro do OneDrive.

## Estado atual
- Parte 3 (Supabase) em andamento. Supabase ativo em 28/10/2026.
- `salvarAnalise` no `server.js` foi atualizada para gravar confianca, modo e fontes. Ainda NÃO foi confirmado se essas colunas estão sendo gravadas, nem foi feito commit.
- `backend/testar-supabase.js` verifica se o Supabase está ativo (o plano gratuito pausa após ~1 semana sem uso; reativar só pelo site).
- Pendente: corrigir um trecho duplicado na constante `REGRAS`, na linha do "Inconclusivo".
- Próximo: criar uma rota para ler o histórico de análises.
- Depois do banco: app em React Native com Expo.

## Regras do projeto
- Responda sempre em português do Brasil.
- O Node não recarrega sozinho: depois de alterar o `server.js`, o servidor precisa ser reiniciado.
- Nunca abra, mostre, copie ou repita o conteúdo do `backend/.env`.
- Nunca faça `git commit` ou `git push` sem pedir.
- Não instale pacotes novos sem explicar para que servem e pedir autorização.
- Não apague arquivos sem pedir.
## Plano até 25/11 (conforme o pré-TCC)
- Requisitos do pré-TCC: RF01 cadastro e autenticação (Supabase Auth + JWT), RF02 envio de texto ou URL, RF03 classificação por IA, RF04 justificativa, RF05 histórico por usuário, RF06 dashboard administrativo, RF07 web (React.js) e mobile (React Native).
- Prontos: RF03 e RF04. Parciais: RF02 (URL a testar), RF05 (grava, falta ler), RF07 (web ainda em HTML puro).
- Até 02/11: confirmar gravação de confianca/modo/fontes, corrigir REGRAS, commit.
- 03/11 a 08/11: login com Supabase Auth, coluna user_id em analises, rota de histórico por usuário. NÃO criar a rota de histórico antes do login.
- 09/11 a 14/11: web em React.js com Vite, na pasta `web`. Reaproveitar o visual do `frontend/index.html` (estilo jornal, 4 selos). Telas: login, análise, histórico e dashboard admin (RF06, métricas por selo e por dia).
- 15/11 a 21/11: app React Native com Expo, na pasta `mobile` (login, análise, histórico). O celular não acessa o localhost do PC: usar o IP do PC na rede ou publicar o backend.
- 22/11 a 25/11: testes, documentação, ensaio da apresentação.
- Se o prazo apertar: priorizar o web completo; o mobile pode sair simplificado.
- A confirmar com o orientador: se 25/11 é entrega ou defesa.