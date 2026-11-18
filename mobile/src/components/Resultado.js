import { Linking, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';
import Selo from './Selo';

export default function Resultado({ dados }) {
  const fontes = (dados.fontes || []).filter((url) => /^https?:\/\//.test(url));

  return (
    <View style={estilos.caixa}>
      <Selo classificacao={dados.classificacao} />
      <Text style={estilos.justificativa}>{dados.justificativa}</Text>

      {fontes.length > 0 && (
        <View style={estilos.bloco}>
          <Text style={estilos.nota}>Fontes consultadas:</Text>
          {fontes.map((url) => (
            <Text key={url} style={estilos.link} onPress={() => Linking.openURL(url)}>
              {url.replace(/^https?:\/\//, '').split('/')[0]}
            </Text>
          ))}
        </View>
      )}

      {dados.modo === 'sem-pesquisa' && (
        <Text style={estilos.nota}>
          Atenção: esta análise foi feita sem pesquisa na web. Notícias recentes podem não ser reconhecidas.
        </Text>
      )}

      {dados.confianca != null && (
        <Text style={estilos.nota}>
          Confiança da IA: {dados.confianca}%. Resultado gerado por inteligência artificial, confira sempre as fontes.
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { marginTop: 16, gap: 10 },
  justificativa: { fontSize: 15, lineHeight: 22, color: cores.tinta },
  bloco: { gap: 4 },
  nota: { fontSize: 12, lineHeight: 18, color: cores.tintaClara },
  link: { fontSize: 13, color: cores.destaque, textDecorationLine: 'underline' }
});
