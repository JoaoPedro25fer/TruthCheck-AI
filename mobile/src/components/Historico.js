import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { buscarHistorico } from '../api';
import { cores, fonteTitulo } from '../tema';
import Resultado from './Resultado';
import Selo from './Selo';

export default function Historico({ token }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(null); // id do item expandido

  useEffect(() => {
    buscarHistorico(token)
      .then(setLista)
      .catch((err) => setErro(err instanceof TypeError ? 'Não consegui falar com o servidor.' : err.message));
  }, [token]);

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Seu histórico</Text>

      {erro ? <Text style={estilos.texto}>Não foi possível carregar: {erro}</Text> : null}
      {!erro && lista === null ? <Text style={estilos.texto}>Carregando...</Text> : null}
      {lista && lista.length === 0 ? <Text style={estilos.texto}>Você ainda não fez nenhuma análise.</Text> : null}

      {(lista || []).map((item) => (
        <Pressable
          key={item.id}
          style={estilos.item}
          onPress={() => setAberto(aberto === item.id ? null : item.id)}
        >
          <Selo classificacao={item.classificacao} />
          <Text style={estilos.noticia} numberOfLines={aberto === item.id ? undefined : 2}>
            {item.noticia}
          </Text>
          <Text style={estilos.data}>{new Date(item.created_at).toLocaleString('pt-BR')}</Text>
          {aberto === item.id ? <Resultado dados={item} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { gap: 12 },
  titulo: { fontFamily: fonteTitulo, fontSize: 28, fontWeight: '700', color: cores.tinta },
  texto: { fontSize: 15, color: cores.tintaSuave },
  item: {
    backgroundColor: cores.papelElevado,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 6,
    padding: 14,
    gap: 8
  },
  noticia: { fontSize: 14, lineHeight: 20, color: cores.tinta },
  data: { fontSize: 12, color: cores.tintaClara }
});
