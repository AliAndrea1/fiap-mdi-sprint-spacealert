## Integrantes

| Nome | RM |
|---|---|
| Ali Andrea Mamani Molle | 558052 |
| Guilherme Linard F.R Gozzi | 555768 |
| Lucas Vasquez Silva | 555159 |

---

## Sobre o App

O SpaceAlert é o dashboard central da solução desenvolvida na Global Solution. Ele consome dados reais de satélites para exibir alertas climáticos, previsões e eventos naturais em tempo real.

*Vertente explorada:* Previsão climática e prevenção de desastres com dados espaciais.

---

## Funcionalidades

- *Dashboard* — nível de risco atual, contagem por categoria e gráfico de alertas
- *Alertas* — lista completa com filtros por nível de risco
- *Previsão* — previsão climática real via CPTEC/INPE + eventos NASA EONET
- *Notificações* — histórico de alertas com leitura e relato de eventos

---

## Tecnologias

- React Native + Expo
- TypeScript
- Expo Router
- Context API
- AsyncStorage
- NASA EONET API
- CPTEC/INPE API

---

## Como executar

*Pré-requisitos:*
- Node.js instalado
- Expo Go instalado no celular
- API SpaceAlert rodando localmente

*1. Clone o repositório:*
bash
git clone https://github.com/seu-usuario/spacealert-mobile
cd spacealert-mobile


*2. Instale as dependências:*
bash
npm install --legacy-peer-deps
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar @react-native-async-storage/async-storage react-native-chart-kit react-native-svg


*3. Configure o IP da API:*

Abra constants/Api.ts e mude para o IP da sua máquina:
ts
export const API_URL = 'http://SEU_IP:8080';


*4. Inicie o app:*
bash
npx expo start


*5. Escaneie o QR Code* com o Expo Go no celular.

---

## Telas

<img width="738" height="1600" alt="Image" src="https://github.com/user-attachments/assets/535294e1-eebc-4519-b1c4-bc79e471809c" />
<img width="738" height="1600" alt="Image" src="https://github.com/user-attachments/assets/314fdc32-dabf-434f-a07d-cbac2bf7c4c3" />
<img width="738" height="1600" alt="Image" src="https://github.com/user-attachments/assets/3b8f45fa-6d69-478e-9780-55247d81fb85" />
<img width="738" height="1600" alt="Image" src="https://github.com/user-attachments/assets/a739cbd3-ce85-4af4-81bd-81f825625346" />
<img width="738" height="1600" alt="Image" src="https://github.com/user-attachments/assets/a3708556-077d-48af-a58e-2133e19f3f99" />

## Link do vídeo no youtube
https://youtube.com/shorts/H8DKo5K5Kvo?si=67D5UdpAyV6IHBgL
---

##ODS Relacionados

- ODS 11 — Cidades e Comunidades Sustentáveis
- ODS 13 — Ação Contra a Mudança Global do Clima
- ODS 9 — Indústria, Inovação e Infraestrutura
