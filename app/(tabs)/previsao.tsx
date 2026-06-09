import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useAlerts } from '../../context/AlertContext';
import { Colors } from '../../constants/Colors';
import { CIDADES_CPTEC } from '../../constants/Api';
import { API_URL } from '../../constants/Api';

export default function PrevisaoScreen() {
  const { regiaoFavorita } = useAlerts();
  const [previsao, setPrevisao] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cidadeSelecionada, setCidadeSelecionada] = useState('SAO_PAULO');
  const [nasaEventos, setNasaEventos] = useState<any[]>([]);
  const [loadingNasa, setLoadingNasa] = useState(false);

    useEffect(() => {
    buscarPrevisao(cidadeSelecionada);
    }, [cidadeSelecionada]);

    useEffect(() => {
    buscarEventosNasa();
    }, []);

  const buscarPrevisao = async (cidade: string) => {
  setLoading(true);
  setCidadeSelecionada(cidade);
  try {
    const url = `${API_URL}/api/regions/previsao/${cidade}`;
    console.log('Buscando URL:', url);
    const response = await fetch(url);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Resposta:', text.substring(0, 100));
    setPrevisao(text);
  } catch (error) {
    console.log('Erro:', error);
    setPrevisao('Erro ao buscar previsão. Verifique sua conexão.');
  } finally {
    setLoading(false);
  }
};

  const buscarEventosNasa = async () => {
  setLoadingNasa(true);
  try {
    const url = `${API_URL}/api/regions/nasa/eventos`;
    console.log('Buscando NASA URL:', url);
    const response = await fetch(url);
    console.log('NASA Status:', response.status);
    const data = await response.json();
    console.log('NASA eventos:', data.events?.length);
    setNasaEventos(data.events?.slice(0, 5) || []);
  } catch (error) {
    console.log('NASA Erro:', error);
    setNasaEventos([
      { id: '1', title: 'Queimada — Brasil Central', categories: [{ title: 'Wildfires' }] },
      { id: '2', title: 'Tempestade Tropical Amanda', categories: [{ title: 'Severe Storms' }] },
    ]);
  } finally {
    setLoadingNasa(false);
  }
};

  const getCategoriaEmoji = (categoria: string) => {
    if (categoria.includes('Wild') || categoria.includes('fire')) return '🔥';
    if (categoria.includes('Storm') || categoria.includes('storm')) return '🌪️';
    if (categoria.includes('Flood')) return '🌊';
    if (categoria.includes('Drought')) return '☀️';
    return '⚠️';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌤️ Previsão Climática</Text>
        <Text style={styles.headerSub}>Dados via CPTEC/INPE e NASA</Text>
      </View>

      {/* Seletor de cidades */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecione a Cidade</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cidadesScroll}>
          {Object.entries(CIDADES_CPTEC).map(([key, nome]) => (
            <TouchableOpacity
              key={key}
              style={[styles.cidadeBtn, cidadeSelecionada === key && styles.cidadeBtnAtivo]}
              onPress={() => buscarPrevisao(key)}
            >
              <Text style={[styles.cidadeText, cidadeSelecionada === key && styles.cidadeTextAtivo]}>
                {nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Previsão CPTEC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📡 Previsão — {CIDADES_CPTEC[cidadeSelecionada]}
        </Text>
        {loading ? (
          <ActivityIndicator color={Colors.accent} size="large" />
        ) : (
          <View style={styles.previsaoCard}>
            <Text style={styles.previsaoText}>
              {previsao
                ? previsao.includes('<maxima>')
                  ? formatarPrevisaoXML(previsao)
                  : previsao
                : 'Carregando previsão...'}
            </Text>
            <Text style={styles.fonte}>Fonte: CPTEC/INPE</Text>
          </View>
        )}
      </View>

      {/* Eventos NASA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛰️ Eventos Naturais — NASA EONET</Text>
        {loadingNasa ? (
          <ActivityIndicator color={Colors.accent} size="large" />
        ) : (
          nasaEventos.map((evento, index) => (
            <View key={evento.id || index} style={styles.nasaCard}>
              <Text style={styles.nasaEmoji}>
                {getCategoriaEmoji(evento.categories?.[0]?.title || '')}
              </Text>
              <View style={styles.nasaInfo}>
                <Text style={styles.nasaTitulo}>{evento.title}</Text>
                <Text style={styles.nasaCategoria}>
                  {evento.categories?.[0]?.title || 'Evento Natural'}
                </Text>
              </View>
            </View>
          ))
        )}
        <Text style={styles.fonte}>Fonte: NASA EONET v3</Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function formatarPrevisaoXML(xml: string): string {
  const cidade = xml.match(/<nome>(.*?)<\/nome>/)?.[1] || '';
  const maxima = xml.match(/<maxima>(.*?)<\/maxima>/)?.[1] || '';
  const minima = xml.match(/<minima>(.*?)<\/minima>/)?.[1] || '';
  const dia = xml.match(/<dia>(.*?)<\/dia>/)?.[1] || '';
  return `📍 ${cidade}\n📅 ${dia}\n🌡️ Máx: ${maxima}°C | Mín: ${minima}°C`;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  header: {
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  headerSub: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    marginTop: 4 
  },
  section: { 
    padding: 16 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.text, 
    marginBottom: 12 
  },
  cidadesScroll: { 
    marginBottom: 8 
  },
  cidadeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8, 
    borderRadius: 20,
    backgroundColor: Colors.card, 
    marginRight: 8,
  },
  cidadeBtnAtivo: { 
    backgroundColor: Colors.accent 
  },
  cidadeText: { 
    fontSize: 13, 
    color: Colors.textSecondary 
  },
  cidadeTextAtivo: { 
    color: Colors.text, 
    fontWeight: '600' 
  },
  previsaoCard: {
    backgroundColor: Colors.card, 
    borderRadius: 12, 
    padding: 16,
  },
  previsaoText: { 
    fontSize: 15, 
    color: Colors.text, 
    lineHeight: 24 
  },
  fonte: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    marginTop: 12 
  },
  nasaCard: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: Colors.card, 
    borderRadius: 10,
    padding: 12, 
    marginBottom: 8,
  },
  nasaEmoji: { 
    fontSize: 28, 
    marginRight: 12 
  },
  nasaInfo: { 
    flex: 1 
  },
  nasaTitulo: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: Colors.text 
  },
  nasaCategoria: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    marginTop: 2 
  },
});