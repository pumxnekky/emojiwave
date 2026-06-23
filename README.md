# 🌊 EmojiWave — Guía completa para subir a Play Store

## Archivos del proyecto

```
emojiwave/
├── App.tsx                    ← Entrada principal
├── app.json                   ← Config de Expo
├── eas.json                   ← Config de EAS Build (Play Store)
├── package.json
├── babel.config.js
├── tsconfig.json
├── server/
│   └── index.js               ← Backend Node.js
└── src/
    ├── screens/
    │   ├── RadarScreen.tsx    ← Pantalla del radar con usuarios cercanos
    │   ├── ChatScreen.tsx     ← Lista de chats + chat individual
    │   ├── ProfileScreen.tsx  ← Perfil y configuración
    │   └── OnboardingScreen.tsx
    ├── components/
    │   ├── EmojiPicker.tsx
    │   └── IncomingReactionModal.tsx
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── services/
    │   ├── socket.ts          ← WebSocket tiempo real
    │   ├── auth.ts            ← ID anónimo + SecureStore
    │   ├── notifications.ts   ← Push notifications
    │   └── proximity.ts       ← BLE / detección de proximidad
    ├── store/
    │   └── useStore.ts        ← Estado global (Zustand)
    └── utils/
        └── theme.ts           ← Colores, tipografía, spacing
```

---

## PASO 1 — Instalar herramientas

```bash
# Node.js (https://nodejs.org) versión 18 o superior
node --version   # debe mostrar v18+

# Instalar Expo CLI y EAS CLI globalmente
npm install -g expo-cli eas-cli

# Verificar
eas --version    # debe mostrar 10+
```

---

## PASO 2 — Crear cuenta en Expo

1. Ve a https://expo.dev/signup y crea tu cuenta (gratis)
2. Confirma tu email

---

## PASO 3 — Configurar el proyecto

```bash
# Clonar / copiar estos archivos a tu computadora
cd emojiwave

# Instalar dependencias
npm install

# Iniciar sesión en Expo
eas login

# Inicializar EAS en el proyecto (te dará un projectId)
eas init
```

Después de `eas init`, copia el `projectId` generado y pégalo en `app.json`:
```json
"extra": {
  "eas": {
    "projectId": "TU-PROJECT-ID-AQUI"
  }
}
```

---

## PASO 4 — Subir el backend

### Opción A — Railway (más fácil, gratis para empezar)
1. Ve a https://railway.app y crea cuenta
2. "New Project" → "Deploy from GitHub repo" o sube la carpeta `server/`
3. Agrega variables de entorno:
   - `JWT_SECRET` = una cadena larga aleatoria (ej: `openssl rand -hex 32`)
   - `PORT` = 3000
4. Copia la URL que te da Railway (ej: `https://emojiwave-xxx.railway.app`)
5. Reemplaza en `src/services/socket.ts`:
   ```typescript
   const SERVER_URL = 'wss://emojiwave-xxx.railway.app';
   ```
   Y en `src/services/auth.ts`:
   ```typescript
   const API_URL = 'https://emojiwave-xxx.railway.app';
   ```

### Opción B — Render (también gratis)
1. Ve a https://render.com
2. "New Web Service" → conecta GitHub o sube código
3. Build command: `npm install`
4. Start command: `node server/index.js`

---

## PASO 5 — Agregar google-services.json (para notificaciones Android)

1. Ve a https://console.firebase.google.com
2. Crea proyecto → "Agregar Android"
3. Package name: `com.emojiwave.app`
4. Descarga `google-services.json`
5. Cópialo a la raíz del proyecto junto a `app.json`

---

## PASO 6 — Build para Play Store

```bash
# Build de producción → genera .aab para Play Store
eas build --platform android --profile production
```

- EAS compila en la nube (~10-15 minutos)
- Al terminar te da un link para descargar el `.aab`
- Descarga el archivo `emojiwave.aab`

---

## PASO 7 — Subir a Google Play Console

1. Ve a https://play.google.com/console
2. "Crear aplicación"
   - Nombre: **EmojiWave**
   - Idioma: Español
   - App o Juego: App
   - Gratis o de pago: Gratis
3. Completa la ficha de Play Store:
   - Descripción corta: "Envía reacciones emoji a personas cerca y haz nuevos amigos 🌊"
   - Descripción larga: (ver abajo)
   - Capturas de pantalla (toma screenshots del simulador)
   - Icono 512x512px
   - Imagen destacada 1024x500px
4. Ve a "Producción" → "Versiones" → "Crear nueva versión"
5. Sube el `.aab`
6. Enviar para revisión

### Descripción sugerida para Play Store:
```
🌊 EmojiWave — Conoce gente cerca de ti con emojis

¿Estás en un café, parque o evento y quieres conocer gente nueva de forma divertida? 
EmojiWave detecta personas cercanas y te permite enviarles reacciones de emojis antes 
de siquiera hablar. ¡Una forma única y segura de romper el hielo!

✨ ¿CÓMO FUNCIONA?
1. El radar detecta a personas cercanas por Bluetooth
2. Selecciona a alguien y envíale un emoji (👋 🔥 😍 🚀)
3. Si ambos conectan, ¡comienza el chat!

🔒 PRIVACIDAD PRIMERO
• Completamente anónimo — sin fotos ni datos personales
• Tu ID cambia cada 15 minutos
• No guardamos tu ubicación GPS
• Solo tú decides con quién conectas

💬 CHAT SEGURO
• Los chats solo se activan cuando ambas personas aceptan
• Mensajes cifrados de extremo a extremo
• Bloquea o reporta usuarios fácilmente
```

---

## PASO 8 — Para iOS (App Store)

```bash
eas build --platform ios --profile production
```
Necesitas una cuenta de Apple Developer ($99/año).

---

## Personalizar antes de lanzar

| Archivo | Qué cambiar |
|---------|-------------|
| `app.json` | `bundleIdentifier`, nombre, icono |
| `src/services/socket.ts` | URL de tu servidor |
| `src/services/auth.ts` | URL de tu API |
| `src/utils/theme.ts` | Colores de la app |
| `server/index.js` | `JWT_SECRET` desde variable de entorno |

---

## Arquitectura de escalabilidad

```
Usuarios → CDN → Load Balancer
                 ├── API Server 1 (Node.js)
                 ├── API Server 2 (Node.js)
                 └── API Server N
                         ↓
                   Redis Pub/Sub (sync entre servidores)
                         ↓
                   PostgreSQL (usuarios, conexiones)
                         ↓
                   Firebase (Push Notifications)
```

Para escalar a 100k usuarios: agrega Redis con `ioredis` + `socket.io-redis` adapter.

---

## Soporte

¿Dudas? El prototipo visual ya funciona desde el primer día. 
El backend en demo mode simula usuarios aunque no haya gente real cerca.

🌊 ¡Buena suerte con EmojiWave!
