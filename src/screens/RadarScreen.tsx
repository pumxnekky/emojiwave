import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Animated, Vibration, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore, NearbyUser } from '../store/useStore';
import { socketService } from '../services/socket';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';
import IncomingReactionModal from '../components/IncomingReactionModal';
import EmojiPicker from '../components/EmojiPicker';

const { width } = Dimensions.get('window');
const RADAR_SIZE = Math.min(width - 48, 320);
const RING_COUNT = 4;

// Demo nearby users for when server is offline
const DEMO_USERS: NearbyUser[] = [
  { id: 'demo1', displayEmoji: '😄', nickname: 'Alex', distance: 12, angle: 45, lastSeen: Date.now(), connected: false },
  { id: 'demo2', displayEmoji: '🥳', nickname: 'Dani', distance: 28, angle: 130, lastSeen: Date.now(), connected: false },
  { id: 'demo3', displayEmoji: '🔥', nickname: 'Sam', distance: 18, angle: 220, lastSeen: Date.now(), connected: false },
  { id: 'demo4', displayEmoji: '💜', nickname: 'Mia', distance: 35, angle: 310, lastSeen: Date.now(), connected: false },
  { id: 'demo5', displayEmoji: '✨', nickname: 'Leo', distance: 8, angle: 170, lastSeen: Date.now(), connected: false },
];

export default function RadarScreen() {
  const { nearbyUsers, selectedUserId, myEmoji, incomingReaction, myId,
    setSelectedUser, setIncomingReaction } = useStore();

  const displayUsers = nearbyUsers.length > 0 ? nearbyUsers : DEMO_USERS;
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  const pulseAnims = useRef(
    Array.from({ length: RING_COUNT }, () => new Animated.Value(0))
  ).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Radar pulse rings
    const animations = pulseAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 700),
          Animated.timing(anim, { toValue: 1, duration: 2800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());

    // Radar scan rotation
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();

    return () => animations.forEach((a) => a.stop());
  }, []);

  const userPosition = (user: NearbyUser) => {
    const maxDistance = 50;
    const r = (user.distance / maxDistance) * (RADAR_SIZE / 2 - 28);
    const rad = (user.angle - 90) * (Math.PI / 180);
    return {
      x: RADAR_SIZE / 2 + r * Math.cos(rad) - 24,
      y: RADAR_SIZE / 2 + r * Math.sin(rad) - 24,
    };
  };

  const handleSendEmoji = useCallback((emoji: string) => {
    if (!selectedUserId) return;
    const target = displayUsers.find((u) => u.id === selectedUserId);
    if (!target) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Show floating emoji
    const pos = userPosition(target);
    const fid = Date.now().toString();
    setFloatingEmojis((prev) => [...prev, { id: fid, emoji, x: pos.x + 12, y: pos.y }]);
    setTimeout(() => setFloatingEmojis((prev) => prev.filter((f) => f.id !== fid)), 1500);

    // Send via socket
    socketService.sendEmojiReaction(
      target.id, emoji, myId, myEmoji, useStore.getState().myNickname
    );

    // Simulate response in demo mode
    if (nearbyUsers.length === 0) {
      setTimeout(() => {
        setIncomingReaction({
          fromId: target.id,
          fromEmoji: target.displayEmoji,
          fromNickname: target.nickname,
          emoji,
          timestamp: Date.now(),
        });
      }, 1500);
    }
  }, [selectedUserId, displayUsers, myId, myEmoji, nearbyUsers.length]);

  const scanRotate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>🌊 EmojiWave</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Radar activo</Text>
        </View>
      </View>

      {/* Radar */}
      <View style={styles.radarWrapper}>
        <View style={[styles.radar, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
          {/* Pulse rings */}
          {pulseAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.ring,
                {
                  width: RADAR_SIZE * (0.25 + i * 0.22),
                  height: RADAR_SIZE * (0.25 + i * 0.22),
                  borderRadius: RADAR_SIZE,
                  opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.2, 0] }),
                  transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.05] }) }],
                },
              ]}
            />
          ))}

          {/* Static grid rings */}
          {[0.28, 0.52, 0.76, 1.0].map((scale, i) => (
            <View
              key={`grid-${i}`}
              style={[styles.gridRing, {
                width: RADAR_SIZE * scale,
                height: RADAR_SIZE * scale,
                borderRadius: RADAR_SIZE,
              }]}
            />
          ))}

          {/* Scan sweep */}
          <Animated.View
            style={[styles.scanSweep, { transform: [{ rotate: scanRotate }] }]}
          />

          {/* Center - me */}
          <View style={styles.centerUser}>
            <Text style={styles.centerEmoji}>{myEmoji}</Text>
          </View>

          {/* Nearby users */}
          {displayUsers.map((user) => {
            const pos = userPosition(user);
            const isSelected = selectedUserId === user.id;
            return (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userBubble,
                  { left: pos.x, top: pos.y },
                  isSelected && styles.userBubbleSelected,
                ]}
                onPress={() => {
                  setSelectedUser(isSelected ? null : user.id);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.userEmoji}>{user.displayEmoji}</Text>
                <Text style={styles.userLabel}>{user.nickname}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Floating emojis */}
          {floatingEmojis.map((fe) => (
            <Animated.Text
              key={fe.id}
              style={[styles.floatingEmoji, { left: fe.x, top: fe.y }]}
            >
              {fe.emoji}
            </Animated.Text>
          ))}
        </View>

        {selectedUserId && (
          <Text style={styles.hint}>
            Enviando a <Text style={{ color: Colors.primaryLight }}>
              {displayUsers.find(u => u.id === selectedUserId)?.nickname}
            </Text>
          </Text>
        )}
        {!selectedUserId && (
          <Text style={styles.hint}>Toca a alguien para seleccionarlo</Text>
        )}
      </View>

      {/* Emoji Picker */}
      <EmojiPicker onSelect={handleSendEmoji} disabled={!selectedUserId} />

      {/* Incoming reaction modal */}
      {incomingReaction && <IncomingReactionModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { ...Typography.heading, color: Colors.textPrimary },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: Colors.successBg, borderRadius: Radius.full,
    borderWidth: 0.5, borderColor: Colors.success + '55',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { ...Typography.caption, color: Colors.success },
  radarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg },
  radar: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute', borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  gridRing: {
    position: 'absolute', borderWidth: 0.5, borderColor: Colors.surfaceBorder,
  },
  scanSweep: {
    position: 'absolute', width: '50%', height: '50%',
    top: '0%', left: '50%',
    backgroundColor: 'transparent',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    // Simulated sweep using border
  },
  centerUser: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryBg, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  centerEmoji: { fontSize: 26 },
  userBubble: {
    position: 'absolute', width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  userBubbleSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryBg,
    transform: [{ scale: 1.15 }],
  },
  userEmoji: { fontSize: 22 },
  userLabel: {
    position: 'absolute', bottom: -18, fontSize: 9,
    color: Colors.textSecondary, textAlign: 'center', width: 60, left: -6,
  },
  floatingEmoji: {
    position: 'absolute', fontSize: 24, zIndex: 20,
  },
  hint: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.md },
});
