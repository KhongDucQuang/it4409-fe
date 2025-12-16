// src/socket.js - Fixed Version
import { io } from 'socket.io-client';
import { API_ROOT } from '~/utils/constants';

// Tạo socket instance với auto-connect
export const socket = io(API_ROOT, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// ===== AUTO JOIN USER ROOM KHI CONNECT =====
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  
  // Tự động join user room khi connect/reconnect
  const userString = localStorage.getItem('userInfo');
  if (userString && userString !== 'undefined') {
    try {
      const currentUser = JSON.parse(userString);
      if (currentUser?.id) {
        socket.emit('join_user_room', currentUser.id);
        console.log(`👤 Auto-joined user room: ${currentUser.id}`);
      }
    } catch (e) {
      console.error('Failed to parse user info:', e);
    }
  }
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔴 Socket connection error:', error);
});

// ===== HELPER FUNCTIONS =====

/**
 * Manual join user room (backup method)
 */
export const joinUserRoom = (userId) => {
  if (!userId) return;
  socket.emit('join_user_room', userId);
  console.log(`👤 Joined user room: ${userId}`);
};

/**
 * Join board room
 */
export const joinBoard = (boardId) => {
  if (!boardId) return;
  socket.emit('join_board', boardId);
  console.log(`📋 Joined board room: ${boardId}`);
};

/**
 * Emit update board
 */
export const emitUpdateBoard = (boardId, data) => {
  socket.emit('FE_UPDATE_BOARD', { boardId, ...data });
};

export default socket;