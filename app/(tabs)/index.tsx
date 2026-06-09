import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAlerts } from '../../context/AlertContext';
import { Colors } from '../../constants/Colors';

const GRAFICO_ALTURA = 180;
const GRAFICO_MAX = 5;

export default function DashboardScreen() {
  const { alerts, loading, fetchAlerts, nivelRiscoAtual } = useAlerts();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const totalEmergencia = alerts.filter(a => a.nivelRisco === 'EMERGENCIA').length;
  const totalAlerta = alerts.filter(a => a.nivelRisco === 'ALERTA').length;
  const totalAtencao = alerts.filter(a => a.nivelRisco === 'ATENCAO').length;

  const getRiscoColor = () => {
    if (nivelRiscoAtual === 'EMERGENCIA') return Colors.emergencia;
    if (nivelRiscoAtual === 'ALERTA') return Colors.alerta;
    return Colors.atencao;
  };

  const getRiscoLabel = () => {
    if (nivelRiscoAtual === 'EMERGENCIA') return 'EMERGÊNCIA';
    if (nivelRiscoAtual === 'ALERTA') return 'ALERTA';
    return 'ATENÇÃO';
  };

  const barras = [
    { label: 'Atenção', valor: totalAtencao, cor: Colors.atencao },
    { label: 'Alerta', valor: totalAlerta, cor: Colors.alerta },
    { label: 'Emergência', valor: totalEmergencia, cor: Colors.emergencia },
  ];

  const alturaPixels = (valor: number) =>
    valor === 0 ? 0 : Math.round((valor / GRAFICO_MAX) * GRAFICO_ALTURA);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAlerts} tintColor={Colors.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🛰️</Text>
        <Text style={styles.headerTitle}>SpaceAlert</Text>
        <Text style={styles.headerSubtitle}>Monitoramento Climático via Satélite</Text>
      </View>

      <View style={[styles.riscoCard, { borderColor: getRiscoColor() }]}>
        <Text style={styles.riscoLabel}>NÍVEL DE RISCO ATUAL</Text>
        <Text style={[styles.riscoValue, { color: getRiscoColor() }]}>
          {getRiscoLabel()}
        </Text>
        <Text style={styles.riscoSub}>
          Baseado em {alerts.length} alertas ativos
        </Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, { borderLeftColor: Colors.emergencia }]}>
          <Text style={styles.cardNumber}>{totalEmergencia}</Text>
          <Text style={styles.cardLabel}>Emergência</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: Colors.alerta }]}>
          <Text style={styles.cardNumber}>{totalAlerta}</Text>
          <Text style={styles.cardLabel}>Alerta</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: Colors.atencao }]}>
          <Text style={styles.cardNumber}>{totalAtencao}</Text>
          <Text style={styles.cardLabel}>Atenção</Text>
        </View>
      </View>

      {/* Gráfico customizado */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Alertas por Nível de Risco</Text>
        <View style={styles.grafico}>

          {/* Eixo Y */}
          <View style={styles.eixoYArea}>
            {[5, 4, 3, 2, 1, 0].map((n) => (
              <Text key={n} style={styles.eixoYLabel}>{n}</Text>
            ))}
          </View>

          {/* Área com linhas + barras */}
          <View style={styles.graficoArea}>
            {/* Linhas horizontais em posição absoluta */}
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <View
                key={n}
                style={[
                  styles.linhaHorizontal,
                  { bottom: (n / GRAFICO_MAX) * GRAFICO_ALTURA }
                ]}
              />
            ))}

            {/* Barras + labels */}
            {barras.map(item => (
              <View key={item.label} style={styles.barraCol}>
                <View
                  style={[
                    styles.barra,
                    {
                      height: alturaPixels(item.valor),
                      backgroundColor: item.cor + '99',
                      borderColor: item.cor,
                    }
                  ]}
                />
                <Text style={styles.barraLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos Alertas</Text>
        {alerts.slice(0, 3).map(alert => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={[styles.alertDot, { backgroundColor: getRiscoColorByLevel(alert.nivelRisco) }]} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitulo}>{alert.titulo}</Text>
              <Text style={styles.alertRegiao}>{alert.regionNome || 'Região não informada'}</Text>
            </View>
            <Text style={[styles.alertNivel, { color: getRiscoColorByLevel(alert.nivelRisco) }]}>
              {alert.nivelRiscoLabel}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.fonte}>
        🛰️ Dados via NASA EONET e CPTEC/INPE
      </Text>
    </ScrollView>
  );
}

function getRiscoColorByLevel(nivel: string) {
  if (nivel === 'EMERGENCIA') return Colors.emergencia;
  if (nivel === 'ALERTA') return Colors.alerta;
  return Colors.atencao;
}

const LABEL_ALTURA = 24;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background },
  header: {
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 24,
    backgroundColor: Colors.primary,
  },
  headerEmoji: { 
    fontSize: 48, 
    marginBottom: 8 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    marginTop: 4 
  },
  riscoCard: {
    margin: 16, 
    padding: 20, 
    backgroundColor: Colors.card,
    borderRadius: 12, 
    borderWidth: 2, 
    alignItems: 'center',
  },
  riscoLabel: { 
  fontSize: 12, 
  color: Colors.textSecondary, 
  letterSpacing: 2 
},
  riscoValue: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 8 },
  riscoSub: { 
    fontSize: 12, 
    color: Colors.textSecondary, 
    marginTop: 4 
  },
  cardsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    gap: 8 
  },
  card: {
    flex: 1, 
    backgroundColor: Colors.card, 
    borderRadius: 10,
    padding: 16, 
    borderLeftWidth: 4, 
    alignItems: 'center',
  },
  cardNumber: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  cardLabel: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    marginTop: 4 
  },
  chartContainer: {
    margin: 16, 
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.text, marginBottom: 12 
  },
  grafico: {
    flexDirection: 'row',
    height: GRAFICO_ALTURA + LABEL_ALTURA,
    alignItems: 'flex-end',
  },
  eixoYArea: {
    width: 20,
    height: GRAFICO_ALTURA,
    justifyContent: 'space-between',
    marginRight: 6,
    marginBottom: LABEL_ALTURA,
  },
  eixoYLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  graficoArea: {
    flex: 1,
    height: GRAFICO_ALTURA + LABEL_ALTURA,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftWidth: 0.5,
    borderLeftColor: Colors.border,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  linhaHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  barraCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: GRAFICO_ALTURA + LABEL_ALTURA,
  },
  barra: {
    width: '45%',
    borderRadius: 4,
    borderWidth: 1,
  },
  barraLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    height: LABEL_ALTURA,
  },
  section: { margin: 16 },
  alertItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: Colors.card, 
    borderRadius: 10,
    padding: 12, 
    marginBottom: 8,
  },
  alertDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 12 },
  alertInfo: { 
    flex: 1 
  },
  alertTitulo: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: Colors.text 
  },
  alertRegiao: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    marginTop: 2 
  },
  alertNivel: { 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  fonte: { 
    textAlign: 'center',
    color: Colors.textSecondary, 
    fontSize: 11, 
    marginBottom: 32 
  },
});