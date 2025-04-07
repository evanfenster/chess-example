'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Initialize socket outside the hook to maintain singleton
let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const initSocket = async () => {
      // Make sure the socket server is running
      await fetch('/api/socketio');
      
      // Initialize socket connection if it doesn't exist
      if (!socket) {
        // Connect to the Socket.io server
        socket = io();
        
        console.log('Socket initialized');
      }
      
      // Connection events
      const onConnect = () => {
        console.log('Socket connected');
        setIsConnected(true);
      };
      
      const onDisconnect = () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      };
      
      const onError = (err: Error) => {
        console.error('Socket error:', err);
      };
      
      // Register event listeners
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('error', onError);
      
      // Initial connection check
      if (socket.connected) {
        setIsConnected(true);
      }
    };
    
    initSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
      }
    };
  }, []);

  // Join a game room
  const joinGame = (gameCode: string) => {
    if (socket && isConnected) {
      socket.emit('join-game', gameCode);
    }
  };

  // Send a move
  const sendMove = (gameCode: string, move: any) => {
    if (socket && isConnected) {
      socket.emit('move', { gameCode, move });
    }
  };

  // Listen for moves
  const onMove = (callback: (move: any) => void) => {
    if (socket) {
      socket.on('move', callback);
      return () => {
        socket?.off('move', callback);
      };
    }
    return () => {};
  };

  return {
    isConnected,
    joinGame,
    sendMove,
    onMove
  };
} 