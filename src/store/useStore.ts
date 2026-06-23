import { create } from 'zustand';

export interface NearbyUser {
  id: string;
  displayEmoji: string;
  nickname: string;
  distance: number; // meters
  angle: number;    // degrees 0-360
  lastSeen: number; // timestamp
  connected: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  emoji?: string;
  timestamp: number;
  type: 'text' | 'emoji' | 'system';
}

export interface Connection {
  userId: string;
  nickname: string;
  displayEmoji: string;
  connectedAt: number;
  messages: Message[];
  unreadCount: number;
}

export interface IncomingReaction {
  fromId: string;
  fromEmoji: string;
  fromNickname: string;
  emoji: string;
  timestamp: number;
}

interface AppStore {
  // User profile
  myId: string;
  myEmoji: string;
  myNickname: string;
  radarActive: boolean;
  radarRadius: number; // meters

  // Nearby
  nearbyUsers: NearbyUser[];
  selectedUserId: string | null;

  // Connections / chats
  connections: Connection[];
  activeConnectionId: string | null;

  // Reactions
  incomingReaction: IncomingReaction | null;

  // Actions
  setProfile: (id: string, emoji: string, nickname: string) => void;
  setRadarActive: (active: boolean) => void;
  setNearbyUsers: (users: NearbyUser[]) => void;
  addNearbyUser: (user: NearbyUser) => void;
  removeNearbyUser: (id: string) => void;
  setSelectedUser: (id: string | null) => void;
  setIncomingReaction: (r: IncomingReaction | null) => void;
  acceptConnection: (userId: string, emoji: string, nickname: string) => void;
  addMessage: (connectionId: string, msg: Message) => void;
  setActiveConnection: (id: string | null) => void;
  markRead: (connectionId: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  myId: '',
  myEmoji: '😎',
  myNickname: 'Tú',
  radarActive: true,
  radarRadius: 50,
  nearbyUsers: [],
  selectedUserId: null,
  connections: [],
  activeConnectionId: null,
  incomingReaction: null,

  setProfile: (id, emoji, nickname) =>
    set({ myId: id, myEmoji: emoji, myNickname: nickname }),

  setRadarActive: (active) => set({ radarActive: active }),

  setNearbyUsers: (users) => set({ nearbyUsers: users }),

  addNearbyUser: (user) =>
    set((s) => ({
      nearbyUsers: s.nearbyUsers.find((u) => u.id === user.id)
        ? s.nearbyUsers.map((u) => (u.id === user.id ? user : u))
        : [...s.nearbyUsers, user],
    })),

  removeNearbyUser: (id) =>
    set((s) => ({ nearbyUsers: s.nearbyUsers.filter((u) => u.id !== id) })),

  setSelectedUser: (id) => set({ selectedUserId: id }),

  setIncomingReaction: (r) => set({ incomingReaction: r }),

  acceptConnection: (userId, emoji, nickname) =>
    set((s) => {
      if (s.connections.find((c) => c.userId === userId)) {
        return { activeConnectionId: userId, incomingReaction: null };
      }
      const newConn: Connection = {
        userId,
        nickname,
        displayEmoji: emoji,
        connectedAt: Date.now(),
        messages: [{
          id: 'sys-1',
          senderId: 'system',
          text: `Conectaste con ${nickname}! Di hola 👋`,
          timestamp: Date.now(),
          type: 'system',
        }],
        unreadCount: 0,
      };
      return {
        connections: [...s.connections, newConn],
        activeConnectionId: userId,
        incomingReaction: null,
      };
    }),

  addMessage: (connectionId, msg) =>
    set((s) => ({
      connections: s.connections.map((c) =>
        c.userId === connectionId
          ? {
              ...c,
              messages: [...c.messages, msg],
              unreadCount: s.activeConnectionId === connectionId
                ? 0
                : c.unreadCount + 1,
            }
          : c
      ),
    })),

  setActiveConnection: (id) =>
    set((s) => ({
      activeConnectionId: id,
      connections: id
        ? s.connections.map((c) =>
            c.userId === id ? { ...c, unreadCount: 0 } : c
          )
        : s.connections,
    })),

  markRead: (connectionId) =>
    set((s) => ({
      connections: s.connections.map((c) =>
        c.userId === connectionId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
