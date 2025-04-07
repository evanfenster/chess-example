import { Server as ServerIO } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    console.log('Socket is initializing');
    const io = new ServerIO(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Handle joining a game room
      socket.on('join-game', (gameCode) => {
        console.log(`Socket ${socket.id} joining game: ${gameCode}`);
        socket.join(gameCode);
      });

      // Handle game moves
      socket.on('move', (data) => {
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

  res.end();
};

export default SocketHandler; 