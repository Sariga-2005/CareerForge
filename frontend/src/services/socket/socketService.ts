import { io, Socket } from 'socket.io-client';
import { store } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { updateMetricsRealtime } from '../../store/slices/analyticsSlice';
import { setNervousnessLevel, appendToTranscript } from '../../store/slices/interviewSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const state = store.getState();
    const token = state.auth.token;

    if (!token) {
      console.warn('No token available for socket connection');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    // Real-time analytics updates
    this.socket.on('analytics:update', (data) => {
      store.dispatch(updateMetricsRealtime(data));
    });

    // Notifications
    this.socket.on('notification', (data) => {
      store.dispatch(
        addNotification({
          id: data.id || Date.now().toString(),
          type: data.type,
          message: data.message,
        })
      );
    });

    // Interview events
    this.socket.on('interview:transcript', (data) => {
      store.dispatch(appendToTranscript(data.text));
    });

    this.socket.on('interview:nervousness', (data) => {
      store.dispatch(setNervousnessLevel(data.level));
    });

    this.socket.on('interview:question', (data) => {
      // Handle new question from AI
      console.log('New question received:', data);
    });

    // Agent actions
    this.socket.on('agent:action', (data) => {
      console.log('Agent action:', data);
      store.dispatch(
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          message: `AI Agent: ${data.action}`,
        })
      );
    });

    // Alumni outreach updates
    this.socket.on('outreach:update', (data) => {
      console.log('Outreach update:', data);
    });
  }

  // Emit events
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Join a room (e.g., for interview sessions)
  joinRoom(roomId: string): void {
    this.emit('join:room', { roomId });
  }

  // Leave a room
  leaveRoom(roomId: string): void {
    this.emit('leave:room', { roomId });
  }

  // Interview specific methods
  startInterviewSession(interviewId: string): void {
    this.emit('interview:start', { interviewId });
  }

  sendAudioChunk(interviewId: string, audioChunk: ArrayBuffer): void {
    this.emit('interview:audio', { interviewId, audioChunk });
  }

  sendVideoFrame(interviewId: string, frameData: string): void {
    this.emit('interview:video', { interviewId, frameData });
  }

  endInterviewSession(interviewId: string): void {
    this.emit('interview:end', { interviewId });
  }

  // Subscribe to specific events
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  // Unsubscribe from events
  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
