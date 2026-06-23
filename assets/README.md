# Assets requeridos

Coloca aquí los siguientes archivos antes de hacer el build:

## Imágenes (obligatorias para EAS Build)

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `icon.png` | 1024x1024px | Ícono principal de la app (fondo oscuro #0D0D1A con emoji 🌊) |
| `adaptive-icon.png` | 1024x1024px | Ícono adaptativo Android (solo el foreground sin fondo) |
| `splash.png` | 1284x2778px | Pantalla de carga (fondo #0D0D1A, logo centrado) |
| `favicon.png` | 48x48px | Para web |
| `notification-icon.png` | 96x96px | Ícono de notificación Android (blanco sobre transparente) |

## Sonidos (opcionales)

| Archivo | Formato | Descripción |
|---------|---------|-------------|
| `sounds/wave.wav` | WAV, <100KB | Sonido de notificación de reacción |

## Cómo crear los assets rápido

### Opción 1 — Canva (gratis)
1. Ve a https://canva.com
2. Crea diseño 1024x1024px
3. Fondo: #0D0D1A (oscuro)
4. Texto grande: 🌊
5. Descarga como PNG

### Opción 2 — Genera assets automáticamente con Expo
```bash
# Instala la herramienta
npx expo install expo-asset

# Genera assets desde un ícono base
npx expo-asset generate icon.png
```

### Opción 3 — Placeholder temporal para pruebas
Expo acepta imágenes de cualquier tamaño durante desarrollo.
Puedes usar cualquier PNG temporalmente y reemplazarlo antes de publicar.

## Colores de marca EmojiWave

- Fondo: `#0D0D1A`
- Primario: `#7C3AED` (violeta)
- Acento: `#06B6D4` (cyan)
- Texto: `#F0EEFF`
