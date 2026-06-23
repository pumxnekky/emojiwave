import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

const SERVER_URL = 'wss://emojiwave-production.up.railway.app'; // Replace with your server URL

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnect = 5;

  connect(userId: string, token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SERVER_URL, {
      auth: { userId, token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnect,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.socket?.emit('join_radar', { userId });
    });

    this.socket.on('nearby_users', (users) => {
      useStore.getState().setNearbyUsers(users);
    });

    this.socket.on('user_appeared', (user) => {
      useStore.getState().addNearbyUser(user);
    });

    this.socket.on('user_left', ({ id }: { id: string }) => {
      useStore.getState().removeNearbyUser(id);
    });

    this.socket.on('incoming_reaction', (data) => {
      useStore.getState().setIncomingReaction(data);
    });

    this.socket.on('chat_message', ({ connectionId, message }) => {
      useStore.getState().addMessage(connectionId, message);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }

  sendEmojiReaction(toUserId: string, emoji: string, fromId: string, fromEmoji: string, fromNickname: string) {
    this.socket?.emit('send_reaction', { toUserId, emoji, fromId, fromEmoji, fromNickname });
  }

  sendMessage(connectionId: string, message: object) {
    this.socket?.emit('send_message', { connectionId, message });
  }

  updatePosition(lat: number, lng: number, userId: string) {
    this.socket?.emit('update_position', { lat, lng, userId });
  }

  acceptReaction(fromId: string, myId: string, myEmoji: string, myNickname: string) {
    this.socket?.emit('accept_reaction', { fromId, myId, myEmoji, myNickname });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
