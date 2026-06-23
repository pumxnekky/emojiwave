import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useStore, Connection, Message } from '../store/useStore';
import { socketService } from '../services/socket';
import { Colors, Spacing, Radius, Typography } from '../utils/theme';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const QUICK_EMOJIS = ['👋', '😂', '🔥', '💜', '✨', '🎉', '👀', '🚀'];

function ChatView({ connection, onBack }: { connection: Connection; onBack: () => void }) {
  const { addMessage, myId, myEmoji } = useStore();
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);

  const send = useCallback((content: string, type: 'text' | 'emoji' = 'text') => {
    if (!content.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: myId,
      text: content,
      timestamp: Date.now(),
      type,
    };
    addMessage(connection.userId, msg);
    socketService.sendMessage(connection.userId, msg);
    if (type === 'text') setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [myId, connection.userId, addMessage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isMe = item.senderId === myId;
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <Text style={styles.msgAvatar}>{connection.displayEmoji}</Text>}
        <View style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          item.type === 'emoji' && styles.bubbleEmoji,
        ]}>
          <Text style={[
            item.type === 'emoji' ? styles.emojiMsg : (isMe ? styles.textMe : styles.textThem),
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatAvatar}>
          <Text style={styles.chatAvatarEmoji}>{connection.displayEmoji}</Text>
        </View>
        <View>
          <Text style={styles.chatName}>{connection.nickname}</Text>
          <Text style={styles.chatSub}>Conectado cerca · {
            formatDistanceToNow(connection.connectedAt, { locale: es, addSuffix: true })
          }</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={connection.messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Quick emojis */}
      <View style={styles.quickRow}>
        {QUICK_EMOJIS.map((e) => (
          <TouchableOpacity key={e} onPress={() => send(e, 'emoji')} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe algo..."
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={() => send(text)}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={() => send(text)}
          disabled={!text.trim()}
        >
          <Text style={styles.sendIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ChatScreen() {
  const { connections, activeConnectionId, setActiveConnection } = useStore();

  if (activeConnectionId) {
    const conn = connections.find((c) => c.userId === activeConnectionId);
    if (conn) {
      return (
        <SafeAreaView style={styles.container}>
          <ChatView connection={conn} onBack={() => setActiveConnection(null)} />
        </SafeAreaView>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Conexiones</Text>
        <Text style={styles.listSub}>{connections.length} activa{connections.length !== 1 ? 's' : ''}</Text>
      </View>

      {connections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌊</Text>
          <Text style={styles.emptyTitle}>Sin conexiones aún</Text>
          <Text style={styles.emptyText}>
            Ve al radar y envía reacciones para conocer gente cerca!
          </Text>
        </View>
      ) : (
        <FlatList
          data={connections}
          keyExtractor={(c) => c.userId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.connCard}
              onPress={() => setActiveConnection(item.userId)}
            >
              <View style={styles.connAvatar}>
                <Text style={styles.connAvatarEmoji}>{item.displayEmoji}</Text>
              </View>
              <View style={styles.connInfo}>
                <Text style={styles.connName}>{item.nickname}</Text>
                <Text style={styles.connPreview} numberOfLines={1}>
                  {item.messages[item.messages.length - 1]?.text ?? ''}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  listHeader: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  listTitle: { ...Typography.heading, color: Colors.textPrimary },
  listSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { ...Typography.heading, color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  connCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.surfaceBorder, padding: 14,
  },
  connAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
  },
  connAvatarEmoji: { fontSize: 24 },
  connInfo: { flex: 1 },
  connName: { ...Typography.label, color: Colors.textPrimary, marginBottom: 2 },
  connPreview: { ...Typography.caption, color: Colors.textSecondary },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  // Chat view
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 20, color: Colors.textPrimary },
  chatAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
  },
  chatAvatarEmoji: { fontSize: 20 },
  chatName: { ...Typography.label, color: Colors.textPrimary },
  chatSub: { ...Typography.caption, color: Colors.textSecondary },
  msgList: { padding: Spacing.md, gap: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 6 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { fontSize: 20, marginBottom: 2 },
  bubble: { maxWidth: '72%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  bubbleEmoji: { backgroundColor: 'transparent', paddingHorizontal: 4 },
  textMe: { ...Typography.body, color: '#fff' },
  textThem: { ...Typography.body, color: Colors.textPrimary },
  emojiMsg: { fontSize: 32 },
  systemMsg: { alignItems: 'center', marginVertical: 8 },
  systemText: { ...Typography.caption, color: Colors.textMuted, fontStyle: 'italic' },
  quickRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    gap: 8, borderTopWidth: 0.5, borderTopColor: Colors.surfaceBorder,
  },
  quickBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
  },
  quickEmoji: { fontSize: 18 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 0.5, borderTopColor: Colors.surfaceBorder,
  },
  input: {
    flex: 1, backgroundColor: Colors.surfaceHigh, borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 10, color: Colors.textPrimary,
    fontSize: 15, maxHeight: 100, borderWidth: 0.5, borderColor: Colors.surfaceBorder,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surfaceHigh },
  sendIcon: { fontSize: 18, color: '#fff' },
});
