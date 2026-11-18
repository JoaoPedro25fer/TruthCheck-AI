// No celular, "localhost" é o próprio celular. Por isso a URL do backend vem do .env
// e deve usar o IP do PC na rede (ex.: http://192.168.0.100:3000).
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function chamar(caminho, opcoes, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(API_URL + caminho, { ...opcoes, headers });
  const dados = await resposta.json();

  if (!resposta.ok) throw new Error(dados.erro || 'Erro desconhecido.');
  return dados;
}

export function analisarNoticia(texto, token) {
  return chamar('/analisar-noticia', { method: 'POST', body: JSON.stringify({ texto }) }, token);
}

export function buscarHistorico(token) {
  return chamar('/historico', { method: 'GET' }, token);
}
