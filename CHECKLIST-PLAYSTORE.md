# ✅ Checklist — Subir EmojiWave a Play Store

## Antes del build

- [ ] Copié el `projectId` de EAS en `app.json`
- [ ] Reemplacé la URL del servidor en `src/services/socket.ts`
- [ ] Reemplacé la URL de la API en `src/services/auth.ts`
- [ ] Descargué `google-services.json` de Firebase y lo puse en la raíz
- [ ] Creé `assets/icon.png` (1024x1024px)
- [ ] Creé `assets/adaptive-icon.png` (1024x1024px)
- [ ] Creé `assets/splash.png` (1284x2778px)
- [ ] Creé `assets/notification-icon.png` (96x96px, blanco/transparente)
- [ ] Ejecuté `npm install` sin errores

## Build

- [ ] `eas login` → sesión iniciada
- [ ] `eas build --platform android --profile production` → completado
- [ ] Descargué el `.aab` del link que dio EAS

## Play Console

- [ ] Cuenta de Google Play Console creada ($25 USD, único pago)
- [ ] App creada: nombre "EmojiWave", package `com.emojiwave.app`
- [ ] Ficha de Play Store completada:
  - [ ] Descripción corta (80 chars)
  - [ ] Descripción larga
  - [ ] Capturas de pantalla (mínimo 2, hasta 8)
  - [ ] Ícono 512x512px
  - [ ] Imagen destacada 1024x500px
- [ ] Clasificación de contenido completada (PEGI/ESRB)
- [ ] Política de privacidad URL agregada
- [ ] `.aab` subido a "Versión de producción" o "Prueba interna"
- [ ] Enviado para revisión (tarda 1-3 días)

## Servidor

- [ ] Servidor desplegado en Railway/Render
- [ ] Variable `JWT_SECRET` configurada en producción
- [ ] Endpoint `/health` responde OK
- [ ] WebSocket acepta conexiones desde la app

## Post-lanzamiento

- [ ] Monitoreo con Railway/Render logs
- [ ] Configurar alertas de errores (Sentry: https://sentry.io gratis)
- [ ] Responder reviews en Play Console
- [ ] Actualizar `versionCode` en `app.json` para cada update

---

💡 **Tip**: Empieza con "Prueba interna" en Play Console — puedes subir
el .aab y probarlo en tu celular en minutos, sin esperar revisión.
Agrega hasta 100 testers con sus emails de Google.
