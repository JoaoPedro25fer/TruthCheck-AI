import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { analisarNoticia } from '../api';
import { cores, fonteTitulo } from '../tema';
import Resultado from './Resultado';

export default function Analise({ token }) {
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  async function enviar() {
    if (!texto.trim()) return;

    setCarregando(true);
    setErro('');
    setResultado(null);

    try {
      setResultado(await analisarNoticia(texto.trim(), token));
    } catch (err) {
      setErro(err instanceof TypeError ? 'Não consegui falar com o servidor. Ele está ligado e na mesma rede?' : err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.nota}>Projeto de Trabalho de Conclusão de Curso · 2026.2</Text>
      <Text style={estilos.titulo}>
        Antes de compartilhar, <Text style={estilos.destaque}>verifique</Text>.
      </Text>
      <Text style={estilos.texto}>
        Cole o texto de uma notícia. A TruthCheck AI pesquisa na web e devolve uma classificação clara, com
        justificativa e fontes.
      </Text>

      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Texto da notícia</Text>
        <TextInput
          style={estilos.campo}
          value={texto}
          onChangeText={setTexto}
          placeholder="Cole aqui o texto da notícia..."
          placeholderTextColor={cores.tintaClara}
          multiline
        />
        <Text style={estilos.nota}>
          {token ? 'Esta análise será salva no seu histórico.' : 'Sem login, a análise não fica no histórico.'}
        </Text>

        <Pressable style={[estilos.botao, carregando && estilos.desligado]} onPress={enviar} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botaoTexto}>Analisar notícia</Text>}
        </Pressable>

        {carregando ? (
          <Text style={estilos.nota}>Pesquisando na web e analisando... pode levar até 30 segundos.</Text>
        ) : null}
        {erro ? <Text style={estilos.erro}>Não foi possível analisar: {erro}</Text> : null}
        {resultado ? <Resultado dados={resultado} /> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { gap: 12 },
  nota: { fontSize: 12, lineHeight: 18, color: cores.tintaClara },
  titulo: { fontFamily: fonteTitulo, fontSize: 34, fontWeight: '700', lineHeight: 40, color: cores.tinta },
  destaque: { color: cores.destaqueEscuro, fontStyle: 'italic' },
  texto: { fontSize: 15, lineHeight: 22, color: cores.tintaSuave },
  cartao: {
    backgroundColor: cores.papelElevado,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 6,
    padding: 16,
    gap: 10,
    marginTop: 8
  },
  rotulo: { fontSize: 13, color: cores.tintaSuave },
  campo: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 3,
    padding: 12,
    minHeight: 110,
    fontSize: 16,
    color: cores.tinta,
    textAlignVertical: 'top'
  },
  botao: { backgroundColor: cores.destaque, borderRadius: 3, paddingVertical: 12, alignItems: 'center' },
  desligado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  erro: { fontSize: 14, color: cores.falso }
});
