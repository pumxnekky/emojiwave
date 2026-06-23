import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';

const EMOJIS = ['👋','🔥','😍','🚀','💜','😂','🎉','👀','⚡','🌊','🥳','✨','❤️','😎','🤩','💫'];

interface Props {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export default function EmojiPicker({ onSelect, disabled }: Props) {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <Text style={styles.label}>
        {disabled ? 'Selecciona a alguien primero 👆' : 'Envía una reacción'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {EMOJIS.map((e) => (
          <TouchableOpacity
            key={e}
            style={styles.btn}
            onPress={() => onSelect(e)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5, borderTopColor: Colors.surfaceBorder,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  containerDisabled: { opacity: 0.45 },
  label: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm },
  row: { gap: 10, paddingRight: Spacing.lg },
  btn: {
    width: 50, height: 50, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
});
