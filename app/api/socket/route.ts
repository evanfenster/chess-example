import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Global to maintain socket connection
let io: SocketIOServer | undefined;

export async function GET(
  req: Request,
  res: Response & { socket: { server: NetServer } }
) {
  if (!io) {
    // Create new Socket.io server
    const httpServer = res.socket.server as any;
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Handle joining a game room
      socket.on('join-game', (gameCode: string) => {
        console.log(`Socket ${socket.id} joining game: ${gameCode}`);
        socket.join(gameCode);
      });

      // Handle game moves
      socket.on('move', (data: { gameCode: string, move: any }) => {
        console.log(`Move in game ${data.gameCode}:`, data.move);
        // Broadcast the move to all other clients in the game
        socket.to(data.gameCode).emit('move', data.move);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  }

  return new NextResponse('Socket is running', {
    status: 200,
  });
} 