import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { updateProfile } from '../services/auth';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';

const EMOJI_OPTIONS = [
  '😎', '🦋', '🌊', '⚡', '🎯', '🦊', '🌙', '🔥',
  '🎸', '🏄', '🎨', '🦁', '🌈', '🎭', '🚀', '💎',
  '🌺', '🦄', '🍀', '🎪', '🌟', '🦅', '🎵', '🏆',
];

export default function ProfileScreen() {
  const { myEmoji, myNickname, radarActive, radarRadius, setProfile, setRadarActive } = useStore();
  const [editingNick, setEditingNick] = useState(false);
  const [nick, setNick] = useState(myNickname);

  const saveNick = () => {
    const trimmed = nick.trim();
    if (trimmed.length < 2) {
      Alert.alert('Nombre muy corto', 'Escribe al menos 2 caracteres');
      return;
    }
    setProfile(useStore.getState().myId, myEmoji, trimmed);
    setEditingNick(false);
  };

  const pickEmoji = (emoji: string) => {
    Haptics.selectionAsync();
    setProfile(useStore.getState().myId, emoji, myNickname);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarEmoji}>{myEmoji}</Text>
          </View>
          {editingNick ? (
            <View style={styles.nickEditRow}>
              <TextInput
                style={styles.nickInput}
                value={nick}
                onChangeText={setNick}
                autoFocus
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={saveNick}
              />
              <TouchableOpacity onPress={saveNick} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Listo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingNick(true)} style={styles.nickRow}>
              <Text style={styles.nickname}>{myNickname}</Text>
              <Text style={styles.editHint}> ✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.location}>Lima, Perú</Text>
        </View>

        {/* Emoji picker */}
        <Text style={styles.sectionTitle}>Tu emoji</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiOption, myEmoji === e && styles.emojiOptionSelected]}
              onPress={() => pickEmoji(e)}
            >
              <Text style={styles.emojiOptionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Radar settings */}
        <Text style={styles.sectionTitle}>Radar</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Visible para otros</Text>
              <Text style={styles.settingDesc}>Apareces en el radar de personas cercanas</Text>
            </View>
            <Switch
              value={radarActive}
              onValueChange={setRadarActive}
              trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Radio de búsqueda</Text>
              <Text style={styles.settingDesc}>{radarRadius} metros</Text>
            </View>
            <Text style={styles.settingValue}>{radarRadius}m</Text>
          </View>
        </View>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>Privacidad</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Usuarios bloqueados</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Política de privacidad</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert(
              'Eliminar cuenta',
              'Se borrarán todos tus datos. Esta acción no se puede deshacer.',
              [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive' }]
            )}
          >
            <Text style={[styles.settingLabel, { color: Colors.danger }]}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>EmojiWave v1.0.0 · Hecho con 🌊 en Lima</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl,
  },
  avatarRing: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryBg, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarEmoji: { fontSize: 38 },
  nickRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  nickname: { ...Typography.title, color: Colors.textPrimary },
  editHint: { fontSize: 16 },
  nickEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nickInput: {
    ...Typography.title, color: Colors.textPrimary,
    borderBottomWidth: 1, borderBottomColor: Colors.primary,
    minWidth: 100, paddingVertical: 2, textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
  },
  saveBtnText: { ...Typography.label, color: '#fff' },
  location: { ...Typography.caption, color: Colors.textSecondary },
  sectionTitle: {
    ...Typography.label, color: Colors.textSecondary,
    marginBottom: Spacing.sm, marginTop: Spacing.xs,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  emojiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
    padding: Spacing.md, marginBottom: Spacing.xl,
  },
  emojiOption: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  emojiOptionSelected: {
    backgroundColor: Colors.primaryBg, borderWidth: 2, borderColor: Colors.primary,
  },
  emojiOptionText: { fontSize: 22 },
  settingsCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xl, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingLabel: { ...Typography.body, color: Colors.textPrimary },
  settingDesc: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  settingValue: { ...Typography.label, color: Colors.primaryLight },
  settingArrow: { fontSize: 18, color: Colors.textMuted },
  divider: { height: 0.5, backgroundColor: Colors.surfaceBorder, marginHorizontal: Spacing.md },
  version: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});
