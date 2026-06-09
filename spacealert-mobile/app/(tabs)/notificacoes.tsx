import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlerts } from '../../context/AlertContext';
import { Colors } from '../../constants/Colors';

interface Notificacao {
  id: number;
  titulo: string;
  nivelRisco: string;
  nivelRiscoLabel: string;
  dataHora: string;
  lida: boolean;
  tipo: 'sistema' | 'usuario';
}

export default function NotificacoesScreen() {
  const { alerts } = useAlerts();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [lidas, setLidas] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formNivel, setFormNivel] = useState<'ATENCAO' | 'ALERTA' | 'EMERGENCIA'>('ATENCAO');
  const [erroTitulo, setErroTitulo] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    carregarLidas();
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      const novas = alerts.map(a => ({
        id: a.id,
        titulo: a.titulo,
        nivelRisco: a.nivelRisco,
        nivelRiscoLabel: a.nivelRiscoLabel,
        dataHora: a.dataHora,
        lida: lidas.includes(a.id),
        tipo: 'sistema' as const,
      }));
      setNotificacoes(novas);
    }
  }, [alerts, lidas]);

  const carregarLidas = async () => {
    try {
      const saved = await AsyncStorage.getItem('@spacealert:lidas');
      if (saved) setLidas(JSON.parse(saved));
    } catch (e) {}
  };

  const marcarLida = async (id: number) => {
    const novasLidas = [...lidas, id];
    setLidas(novasLidas);
    await AsyncStorage.setItem('@spacealert:lidas', JSON.stringify(novasLidas));
  };

  const marcarTodasLidas = async () => {
    const todasIds = notificacoes.map(n => n.id);
    setLidas(todasIds);
    await AsyncStorage.setItem('@spacealert:lidas', JSON.stringify(todasIds));
  };

  const limparHistorico = async () => {
    setLidas([]);
    await AsyncStorage.removeItem('@spacealert:lidas');
  };

  const validarFormulario = () => {
    let valido = true;
    setErroTitulo('');
    setSucesso(false);
    if (!formTitulo.trim()) {
      setErroTitulo('Descrição do evento é obrigatória');
      valido = false;
    } else if (formTitulo.trim().length < 5) {
      setErroTitulo('Descrição deve ter pelo menos 5 caracteres');
      valido = false;
    }
    return valido;
  };

  const salvarRelato = async () => {
    if (!validarFormulario()) return;
    const niveiLabel: Record<string, string> = {
      ATENCAO: 'Atenção', ALERTA: 'Alerta', EMERGENCIA: 'Emergência',
    };
    const novaNotif: Notificacao = {
      id: Date.now(),
      titulo: formTitulo.trim(),
      nivelRisco: formNivel,
      nivelRiscoLabel: niveiLabel[formNivel],
      dataHora: new Date().toISOString(),
      lida: false,
      tipo: 'usuario',
    };
    const atualizadas = [novaNotif, ...notificacoes];
    setNotificacoes(atualizadas);
    const userNotifs = atualizadas.filter(n => n.tipo === 'usuario');
    await AsyncStorage.setItem('@spacealert:relatos', JSON.stringify(userNotifs));
    setSucesso(true);
    setFormTitulo('');
    setFormNivel('ATENCAO');
    setTimeout(() => {
      setModalVisible(false);
      setSucesso(false);
    }, 1500);
  };

  const naoLidas = notificacoes.filter(n => !lidas.includes(n.id)).length;

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
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🔔 Notificações</Text>
          {naoLidas > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{naoLidas}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSub}>
          {naoLidas > 0 ? `${naoLidas} não lidas` : 'Todas lidas'}
        </Text>
      </View>

      {/* Botões de ação */}
      <View style={styles.acoes}>
        <TouchableOpacity style={styles.acaoBtn} onPress={marcarTodasLidas}>
          <Text style={styles.acaoBtnText}>✓ Marcar todas lidas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acaoBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.acaoBtnText}>＋ Relatar evento</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        style={[styles.acaoBtn, styles.acaoBtnLimpar]} onPress={limparHistorico}> <Text style={styles.acaoBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <ScrollView style={styles.lista}>
        {notificacoes.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioEmoji}>🔕</Text>
            <Text style={styles.vazioText}>Nenhuma notificação</Text>
          </View>
        ) : (
          notificacoes.map(notif => {
            const isLida = lidas.includes(notif.id);
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, isLida && styles.notifLida]}
                onPress={() => marcarLida(notif.id)}
              >
                <View style={[styles.notifDot, { backgroundColor: isLida ? Colors.border : getRiscoColor(notif.nivelRisco) }]} />
                <View style={styles.notifInfo}>
                  <View style={styles.notifTituloRow}>
                    <Text style={[styles.notifTitulo, isLida && styles.textLido]}>
                      {notif.titulo}
                    </Text>
                    {notif.tipo === 'usuario' && (
                      <Text style={styles.tagUsuario}>você</Text>
                    )}
                  </View>
                  <Text style={styles.notifData}>{formatData(notif.dataHora)}</Text>
                </View>
                <View style={[styles.notifBadge, { backgroundColor: getRiscoColor(notif.nivelRisco) + (isLida ? '44' : 'cc') }]}>
                  <Text style={styles.notifBadgeText}>{notif.nivelRiscoLabel}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>📢 Relatar Evento Climático</Text>
            <Text style={styles.modalSub}>Registre um evento que você observou na sua região.</Text>
            <Text style={styles.label}>Descrição do evento *</Text>
            <TextInput
              style={[styles.input, erroTitulo ? styles.inputErro : null]}
              placeholder="Ex: Chuva forte com granizo em SP"
              placeholderTextColor={Colors.textSecondary}
              value={formTitulo}
              onChangeText={setFormTitulo}
              multiline
            />
            {erroTitulo ? <Text style={styles.erro}>{erroTitulo}</Text> : null}
            <Text style={styles.label}>Nível de risco *</Text>
            <View style={styles.nivelRow}>
              {(['ATENCAO', 'ALERTA', 'EMERGENCIA'] as const).map(nivel => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.nivelBtn,
                    { borderColor: getRiscoColor(nivel) },
                    formNivel === nivel && { backgroundColor: getRiscoColor(nivel) }
                  ]}
                  onPress={() => setFormNivel(nivel)}
                >
                  <Text style={[styles.nivelBtnText, formNivel === nivel && { color: Colors.text }]}>
                    {nivel === 'ATENCAO' ? 'Atenção' : nivel === 'ALERTA' ? 'Alerta' : 'Emergência'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {sucesso && (
              <View style={styles.sucessoBox}>
                <Text style={styles.sucessoText}>✅ Evento registrado!</Text>
              </View>
            )}
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={() => { setModalVisible(false); setErroTitulo(''); setSucesso(false); }}
              >
                <Text style={styles.botaoText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botao, styles.botaoSalvar]} onPress={salvarRelato}>
                <Text style={styles.botaoText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
},
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.text 
},
  badge: {
    backgroundColor: Colors.text, 
    borderRadius: 12,
    paddingHorizontal: 8, 
    paddingVertical: 2,
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: Colors.primary 
},
  headerSub: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    marginTop: 4 
},
  acoes: {
    flexDirection: 'row', 
    gap: 8, padding: 12,
    backgroundColor: Colors.cardSecondary,
  },
  acaoBtn: {
    flex: 1, 
    backgroundColor: Colors.card, 
    borderRadius: 8,
    padding: 8, 
    alignItems: 'center',
  },
  acaoBtnText: { 
    fontSize: 11, 
    color: Colors.text, 
    fontWeight: '600' 
},
  lista: { 
    flex: 1, 
    padding: 16 
  },
  notifCard: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: Colors.card, 
    borderRadius: 12,
    padding: 14, 
    marginBottom: 10,
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  notifLida: { 
    opacity: 0.5 
},
  notifDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 12 
},
  notifInfo: { 
    flex: 1 
},
  notifTituloRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 6 
},
  notifTitulo: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: Colors.text, 
    flex: 1 
},
  textLido: { 
    color: Colors.textSecondary 
},
  tagUsuario: {
    fontSize: 9, 
    color: Colors.primary, 
    fontWeight: 'bold',
    borderWidth: 1, 
    borderColor: Colors.primary,
    paddingHorizontal: 4, 
    paddingVertical: 1, 
    borderRadius: 4,
  },
  notifData: { 
    fontSize: 11, 
    color: Colors.textSecondary, 
    marginTop: 2 
},
  notifBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
},
  notifBadgeText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: Colors.text 
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
  modalOverlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, 
    padding: 24,
  },
  modalTitulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.text, marginBottom: 4 
},
  modalSub: { 
    fontSize: 13, 
    color: Colors.textSecondary, 
    marginBottom: 20 
},
  label: { 
    fontSize: 13, 
    color: Colors.text, marginBottom: 6,
    fontWeight: '600' 
    },
  input: {
    backgroundColor: Colors.cardSecondary, 
    borderRadius: 10,
    padding: 14, 
    color: Colors.text, 
    fontSize: 14,
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginBottom: 4,
    minHeight: 60, 
    textAlignVertical: 'top',
  },
  inputErro: { 
    borderColor: Colors.emergencia 
},
  erro: { 
    fontSize: 12, 
    color: Colors.emergencia, 
    marginBottom: 12 
},
  nivelRow: { 
    flexDirection: 'row', 
    gap: 8, marginBottom: 16 
},
  nivelBtn: {
    flex: 1, 
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5, 
    alignItems: 'center',
  },
  nivelBtnText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: Colors.textSecondary 
},
  sucessoBox: {
    backgroundColor: Colors.safe + '22', borderRadius: 10,
    padding: 12, 
    marginBottom: 12,
    borderWidth: 1, 
    borderColor: Colors.safe,
  },
  sucessoText: { 
    color: Colors.safe, 
    fontSize: 13, 
    fontWeight: '600', 
    textAlign: 'center' 
},
  modalBotoes: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 8 
},
  botao: { 
    flex: 1, 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
},
  botaoCancelar: { 
    backgroundColor: Colors.cardSecondary 
},
  botaoSalvar: { 
    backgroundColor: Colors.primary 
},
  botaoText: { 
    color: Colors.text, 
    fontSize: 15, 
    fontWeight: 'bold' },

  acaoBtnLimpar: {
  flex: 0,
  width: 80,
  paddingHorizontal: 0,
  
},
});