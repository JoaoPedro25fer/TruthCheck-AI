import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

const CARIMBOS = {
  Verificado: { cor: cores.verificado, texto: 'VERIFICADO' },
  Falso: { cor: cores.falso, texto: 'FALSO' },
  Enganoso: { cor: cores.enganoso, texto: 'ENGANOSO' },
  Inconclusivo: { cor: cores.inconclusivo, texto: 'INCONCLUSIVO' }
};

export default function Selo({ classificacao }) {
  const carimbo = CARIMBOS[classificacao] || CARIMBOS.Inconclusivo;
  return (
    <View style={[estilos.caixa, { borderColor: carimbo.cor }]}>
      <Text style={[estilos.texto, { color: carimbo.cor }]}>{carimbo.texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  texto: { fontSize: 12, fontWeight: '700', letterSpacing: 1 }
});
