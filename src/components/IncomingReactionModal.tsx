import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { socketService } from '../services/socket';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';

export default function IncomingReactionModal() {
  const { incomingReaction, setIncomingReaction, acceptConnection, myId, myEmoji, myNickname } = useStore();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!incomingReaction) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
    dismissTimer.current = setTimeout(dismiss, 7000);
    return () => clearTimeout(dismissTimer.current);
  }, [incomingReaction]);

  const dismiss = () => {
    Animated.timing(slideAnim, { toValue: -120, duration: 250, useNativeDriver: true }).start(() =>
      setIncomingReaction(null)
    );
  };

  const accept = () => {
    if (!incomingReaction) return;
    clearTimeout(dismissTimer.current);
    socketService.acceptReaction(incomingReaction.fromId, myId, myEmoji, myNickname);
    acceptConnection(incomingReaction.fromId, incomingReaction.fromEmoji, incomingReaction.fromNickname);
    dismiss();
  };

  if (!incomingReaction) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.card}>
        <Text style={styles.bigEmoji}>{incomingReaction.fromEmoji}</Text>
        <View style={styles.info}>
          <Text style={styles.title}>
            <Text style={{ color: Colors.primaryLight }}>{incomingReaction.fromNickname}</Text>
            {' '}te envió {incomingReaction.emoji}
          </Text>
          <Text style={styles.sub}>Quiere conectar contigo!</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={accept}>
              <Text style={styles.acceptText}>Conectar 🤝</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissBtn} onPress={dismiss}>
              <Text style={styles.dismissText}>Ignorar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 70, left: Spacing.lg, right: Spacing.lg, zIndex: 999,
  },
  card: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.primary + '55',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 16,
  },
  bigEmoji: { fontSize: 40 },
  info: { flex: 1 },
  title: { ...Typography.body, color: Colors.textPrimary, marginBottom: 2 },
  sub: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 8, alignItems: 'center',
  },
  acceptText: { ...Typography.label, color: '#fff' },
  dismissBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 0.5, borderColor: Colors.surfaceBorder,
  },
  dismissText: { ...Typography.label, color: Colors.textSecondary },
});
