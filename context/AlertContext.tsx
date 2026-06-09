import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RiskLevel = 'ATENCAO' | 'ALERTA' | 'EMERGENCIA';

export interface Alert {
  id: number;
  titulo: string;
  descricao: string;
  nivelRisco: RiskLevel;
  nivelRiscoLabel: string;
  latitude: number;
  longitude: number;
  dataHora: string;
  ativo: boolean;
  tipoAlerta: string;
  mensagemAlerta: string;
  regionNome: string | null;
}

interface AlertContextType {
  alerts: Alert[];
  loading: boolean;
  regiaoFavorita: string;
  setRegiaoFavorita: (regiao: string) => void;
  fetchAlerts: () => Promise<void>;
  nivelRiscoAtual: RiskLevel;
}

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

// URL da API — dados mockados caso API esteja offline
const API_URL = 'http://10.0.2.2:8080'; 

const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    titulo: 'Enchente no Vale do Paraiba',
    descricao: 'Chuvas intensas previstas para as proximas 48h com risco de alagamento',
    nivelRisco: 'EMERGENCIA',
    nivelRiscoLabel: 'Emergência',
    latitude: -23.1896,
    longitude: -45.8841,
    dataHora: new Date().toISOString(),
    ativo: true,
    tipoAlerta: 'DESASTRE_NATURAL',
    mensagemAlerta: '[Emergência] ENCHENTE — Enchente no Vale do Paraiba. Área afetada: 120,5 km².',
    regionNome: 'Vale do Paraiba',
  },
  {
    id: 2,
    titulo: 'Queimada no Cerrado',
    descricao: 'Foco de incendio detectado por satelite INPE',
    nivelRisco: 'ALERTA',
    nivelRiscoLabel: 'Alerta',
    latitude: -15.7801,
    longitude: -47.9292,
    dataHora: new Date().toISOString(),
    ativo: true,
    tipoAlerta: 'DESASTRE_NATURAL',
    mensagemAlerta: '[Alerta] QUEIMADA — Queimada no Cerrado. Área afetada: 320,5 km².',
    regionNome: 'Cerrado Central',
  },
  {
    id: 3,
    titulo: 'Seca no Nordeste',
    descricao: 'Deficit hidrico critico detectado por satelite',
    nivelRisco: 'ATENCAO',
    nivelRiscoLabel: 'Atenção',
    latitude: -7.1195,
    longitude: -36.7240,
    dataHora: new Date().toISOString(),
    ativo: true,
    tipoAlerta: 'DESASTRE_NATURAL',
    mensagemAlerta: '[Atenção] SECA — Seca no Nordeste. População em risco: 120.000 pessoas.',
    regionNome: 'Nordeste',
  },
];

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [regiaoFavorita, setRegiaoFavoritaState] = useState('SAO_PAULO');

  useEffect(() => {
    const loadRegiao = async () => {
      const saved = await AsyncStorage.getItem('@spacealert:regiao');
      if (saved) setRegiaoFavoritaState(saved);
    };
    loadRegiao();
    fetchAlerts();
  }, []);

  const setRegiaoFavorita = async (regiao: string) => {
    setRegiaoFavoritaState(regiao);
    await AsyncStorage.setItem('@spacealert:regiao', regiao);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.log('API offline, usando dados mockados');
      setAlerts(MOCK_ALERTS);
    } finally {
      setLoading(false);
    }
  };

  const nivelRiscoAtual: RiskLevel = alerts.length === 0
    ? 'ATENCAO'
    : alerts.reduce((maior, alert) => {
        const ordem = { ATENCAO: 1, ALERTA: 2, EMERGENCIA: 3 };
        return ordem[alert.nivelRisco] > ordem[maior] ? alert.nivelRisco : maior;
      }, 'ATENCAO' as RiskLevel);

  return (
    <AlertContext.Provider value={{
      alerts,
      loading,
      regiaoFavorita,
      setRegiaoFavorita,
      fetchAlerts,
      nivelRiscoAtual,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);