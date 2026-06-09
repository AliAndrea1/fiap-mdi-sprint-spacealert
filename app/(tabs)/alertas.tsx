import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl
} from 'react-native';
import { useAlerts } from '../../context/AlertContext';
import { Colors } from '../../constants/Colors';

type Filtro = 'TODOS' | 'ATENCAO' | 'ALERTA' | 'EMERGENCIA';

export default function AlertasScreen() {
  const { alerts, loading, fetchAlerts } = useAlerts();
  const [filtro, setFiltro] = useState<Filtro>('TODOS');

  const alertasFiltrados = filtro === 'TODOS'
    ? alerts
    : alerts.filter(a => a.nivelRisco === filtro);

  const getRiscoColor = (nivel: string) => {
    if (nivel === 'EMERGENCIA') return Colors.emergencia;
    if (nivel === 'ALERTA') return Colors.alerta;
    return Colors.atencao;
  };

  const formatData = (dataHora: string) => {
    const data = new Date(dataHora);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚠️ Alertas Ativos</Text>
        <Text style={styles.headerSub}>{alerts.length} alertas no sistema</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {(['TODOS', 'EMERGENCIA', 'ALERTA', 'ATENCAO'] as Filtro[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextAtivo]}>
              {f === 'TODOS' ? 'Todos' : f === 'EMERGENCIA' ? 'Emergência' : f === 'ALERTA' ? 'Alerta' : 'Atenção'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de alertas */}
      <ScrollView
        style={styles.lista}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAlerts} tintColor={Colors.accent} />
        }
      >
        {alertasFiltrados.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioEmoji}>✅</Text>
            <Text style={styles.vazioText}>Nenhum alerta encontrado</Text>
          </View>
        ) : (
          alertasFiltrados.map(alert => (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getRiscoColor(alert.nivelRisco) }]}>
              <View style={styles.alertHeader}>
                <View style={[styles.badge, { backgroundColor: getRiscoColor(alert.nivelRisco) }]}>
                  <Text style={styles.badgeText}>{alert.nivelRiscoLabel}</Text>
                </View>
                <Text style={styles.alertData}>{formatData(alert.dataHora)}</Text>
              </View>

              <Text style={styles.alertTitulo}>{alert.titulo}</Text>
              <Text style={styles.alertDescricao}>{alert.descricao}</Text>

              <View style={styles.alertFooter}>
                <Text style={styles.alertInfo}>📍 {alert.regionNome || 'Região não informada'}</Text>
                <Text style={styles.alertInfo}>🌡️ {alert.tipoAlerta.replace('_', ' ')}</Text>
              </View>

              <Text style={styles.mensagemAlerta}>{alert.mensagemAlerta}</Text>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
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
  filtros: {
    flexDirection: 'row', 
    padding: 12, gap: 8,
    backgroundColor: Colors.cardSecondary,
  },
  filtroBtn: {
    flex: 1, 
    paddingVertical: 8, 
    borderRadius: 8,
    backgroundColor: Colors.card, 
    alignItems: 'center',
  },
  filtroBtnAtivo: { 
    backgroundColor: Colors.accent 
  },
  filtroText: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    fontWeight: '600' 
  },
  filtroTextAtivo: { 
    color: Colors.text 
  },
  lista: { 
    flex: 1, 
    padding: 16 
  },
  alertCard: {
    backgroundColor: Colors.card, 
    borderRadius: 12,
    padding: 16, 
    marginBottom: 12, 
    borderLeftWidth: 4,
  },
  alertHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  alertData: { 
    fontSize: 11, 
    color: Colors.textSecondary 
  },
  alertTitulo: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.text, 
    marginBottom: 4 
  },
  alertDescricao: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    marginBottom: 12 
  },
  alertFooter: { 
    flexDirection: 'row', 
    gap: 16, 
    marginBottom: 8 
  },
  alertInfo: { 
    fontSize: 12, 
    color: Colors.textSecondary 
  },
  mensagemAlerta: {
    fontSize: 12, 
    color: Colors.text,
    backgroundColor: Colors.cardSecondary,
    padding: 10, borderRadius: 8, marginTop: 4,
  },
  vazio: { 
    alignItems: 'center', 
    paddingTop: 80 
  },
  vazioEmoji: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  vazioText: { 
    fontSize: 16, 
    color: Colors.textSecondary 
  },
});