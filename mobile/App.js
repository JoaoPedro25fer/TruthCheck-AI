import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/supabase';
import { cores, fonteTitulo } from './src/tema';
import Analise from './src/components/Analise';
import Historico from './src/components/Historico';
import Login from './src/components/Login';

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('analisar');

  // Recupera a sessão guardada no celular e escuta entradas e saídas (igual ao site).
  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <View style={estilos.centro}>
        <Text style={estilos.aviso}>
          Falta configurar o arquivo mobile/.env com a chave pública do Supabase (veja mobile/.env.example).
        </Text>
      </View>
    );
  }
  if (carregando) return <View style={estilos.centro} />;

  const token = sessao ? sessao.access_token : null;

  async function sair() {
    await supabase.auth.signOut();
    setAba('analisar');
  }

  function Aba({ nome, rotulo }) {
    return (
      <Pressable onPress={() => setAba(nome)} style={[estilos.aba, aba === nome && estilos.abaAtiva]}>
        <Text style={[estilos.abaTexto, aba === nome && estilos.abaTextoAtivo]}>{rotulo}</Text>
      </Pressable>
    );
  }

  return (
    <View style={estilos.tela}>
      <StatusBar style="dark" />

      <View style={estilos.cabecalho}>
        <Text style={estilos.marca}>
          Truth<Text style={estilos.marcaDestaque}>Check</Text> AI
        </Text>
        {sessao ? (
          <Pressable onPress={sair}>
            <Text style={estilos.sair}>Sair</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={estilos.abas}>
        <Aba nome="analisar" rotulo="Analisar" />
        <Aba nome="historico" rotulo="Histórico" />
        {!sessao ? <Aba nome="login" rotulo="Entrar" /> : null}
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        {aba === 'analisar' && <Analise token={token} />}
        {aba === 'historico' &&
          (sessao ? <Historico token={token} /> : <Login aviso="Entre para ver o seu histórico." />)}
        {aba === 'login' && <Login aoEntrar={() => setAba('analisar')} />}
        {sessao ? <Text style={estilos.email}>Conectado como {sessao.user.email}</Text> : null}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel, paddingTop: 48 },
  centro: { flex: 1, backgroundColor: cores.papel, justifyContent: 'center', padding: 24 },
  aviso: { fontSize: 15, color: cores.tintaSuave, textAlign: 'center' },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8
  },
  marca: { fontFamily: fonteTitulo, fontSize: 24, fontWeight: '700', color: cores.tinta },
  marcaDestaque: { color: cores.destaque, fontStyle: 'italic' },
  sair: { color: cores.destaque, fontSize: 15, fontWeight: '600' },
  abas: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha
  },
  aba: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 3 },
  abaAtiva: { backgroundColor: cores.tinta },
  abaTexto: { fontSize: 14, color: cores.tintaSuave },
  abaTextoAtivo: { color: cores.papel, fontWeight: '600' },
  conteudo: { padding: 20, paddingBottom: 48, gap: 16 },
  email: { fontSize: 12, color: cores.tintaClara, textAlign: 'center', marginTop: 16 }
});
