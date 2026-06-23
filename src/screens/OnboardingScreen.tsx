import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';

const STEPS = [
  { emoji: '🌊', title: 'Bienvenido a EmojiWave', desc: 'La forma más divertida de conocer gente cerca de ti. Sin fotos, sin datos personales. Solo emojis y buenas vibras.' },
  { emoji: '📡', title: 'El Radar', desc: 'Detecta a personas cerca usando Bluetooth. Aparecen como emojis en tu pantalla. ¡Anónimo y seguro!' },
  { emoji: '🎉', title: 'Envía reacciones', desc: 'Toca a alguien en el radar y envíale un emoji. Si ambos conectan, ¡comienza el chat!' },
  { emoji: '🔒', title: 'Tu privacidad, primero', desc: 'Tu ID rota cada 15 minutos. No guardamos tu ubicación. Solo tú decides con quién conectas.' },
];

interface Props { onDone: () => void }

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.bigEmoji}>{current.emoji}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.desc}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={isLast ? onDone : () => setStep((s) => s + 1)}
        >
          <Text style={styles.primaryBtnText}>{isLast ? 'Empezar 🚀' : 'Siguiente'}</Text>
        </TouchableOpacity>
        {!isLast && (
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  bigEmoji: { fontSize: 72, marginBottom: 24 },
  title: { ...Typography.title, color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  desc: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHigh },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  actions: { padding: Spacing.xl, gap: 16 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { ...Typography.heading, color: '#fff' },
  skipText: { ...Typography.label, color: Colors.textMuted, textAlign: 'center' },
});
