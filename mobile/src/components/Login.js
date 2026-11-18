import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../supabase';
import { cores, fonteTitulo } from '../tema';

function traduzir(mensagem) {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (mensagem.includes('already registered')) return 'Este e-mail já está cadastrado.';
  if (mensagem.includes('at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return mensagem;
}

export default function Login({ aviso, aoEntrar }) {
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [info, setInfo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!email.trim() || !senha) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setErro('');
    setInfo('');
    setEnviando(true);

    const dados = { email: email.trim(), password: senha };
    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword(dados)
        : await supabase.auth.signUp(dados);

    setEnviando(false);

    if (error) {
      setErro(traduzir(error.message));
      return;
    }
    if (modo === 'cadastrar' && !data.session) {
      setInfo('Cadastro feito. Confirme o seu e-mail para entrar.');
      return;
    }
    if (aoEntrar) aoEntrar();
  }

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>
      {aviso ? <Text style={estilos.texto}>{aviso}</Text> : null}

      <Text style={estilos.rotulo}>E-mail</Text>
      <TextInput
        style={estilos.campo}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={estilos.rotulo}>Senha</Text>
      <TextInput style={estilos.campo} value={senha} onChangeText={setSenha} secureTextEntry />

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      {info ? <Text style={estilos.texto}>{info}</Text> : null}

      <Pressable style={[estilos.botao, enviando && estilos.desligado]} onPress={enviar} disabled={enviando}>
        {enviando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={estilos.botaoTexto}>{modo === 'entrar' ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}>
        <Text style={estilos.link}>{modo === 'entrar' ? 'Não tenho conta' : 'Já tenho conta'}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.papelElevado,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 6,
    padding: 20,
    gap: 8
  },
  titulo: { fontFamily: fonteTitulo, fontSize: 26, fontWeight: '700', color: cores.tinta },
  rotulo: { fontSize: 13, color: cores.tintaSuave, marginTop: 8 },
  campo: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: cores.tinta
  },
  texto: { fontSize: 14, color: cores.tintaSuave },
  erro: { fontSize: 14, color: cores.falso },
  botao: {
    backgroundColor: cores.destaque,
    borderRadius: 3,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12
  },
  desligado: { opacity: 0.6 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: cores.destaque, textDecorationLine: 'underline', marginTop: 12, textAlign: 'center' }
});
