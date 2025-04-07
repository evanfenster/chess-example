'use client';

import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { cn } from '@/lib/utils';
import { makeMove } from '@/lib/actions/chess';
import { useSocket } from '@/lib/hooks/useSocket';

interface ChessBoardProps {
  className?: string;
  gameCode: string;
  initialFen?: string;
  isPlayerTurn?: boolean;
  playerColor?: 'white' | 'black';
}

type Square = {
  file: string;
  rank: string;
  coordinate: string; // e.g. "a1", "e4"
  piece: {
    type: string;
    color: string;
  } | null;
};

type BoardState = Square[][];

export function ChessBoard({ 
  className, 
  gameCode, 
  initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  isPlayerTurn = true,
  playerColor = 'white'
}: ChessBoardProps) {
  const [chess, setChess] = useState<Chess>(new Chess(initialFen));
  const [board, setBoard] = useState<BoardState>(parseFenToBoard(initialFen));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [isCheck, setIsCheck] = useState(false);
  
  // Socket connection
  const { sendMove } = useSocket();

  // Initialize chess engine and board
  useEffect(() => {
    const newChess = new Chess(initialFen);
    setChess(newChess);
    setBoard(parseFenToBoard(initialFen));
    setIsCheck(newChess.inCheck());
  }, [initialFen]);

  // Parse FEN string to our board state format
  function parseFenToBoard(fen: string): BoardState {
    const game = new Chess(fen);
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    return ranks.map((rank, rankIndex) => 
      files.map((file, fileIndex) => {
        const coordinate = `${file}${rank}`;
        const piece = game.get(coordinate as any);
        
        return {
          file,
          rank,
          coordinate,
          piece: piece ? {
            type: piece.type,
            color: piece.color === 'w' ? 'white' : 'black'
          } : null
        };
      })
    );
  }

  // Find valid moves for the selected piece
  function findValidMoves(square: Square): string[] {
    if (!square.piece) return [];
    
    const moves = chess.moves({ 
      square: square.coordinate as any, 
      verbose: true 
    });
    
    return moves.map(move => move.to);
  }

  // Handle square click
  const handleSquareClick = async (square: Square) => {
    if (!isPlayerTurn) return;
    
    // Check if it's not the player's turn (piece color doesn't match player color)
    if (square.piece && square.piece.color !== playerColor) return;
    
    if (!selectedSquare) {
      // First click - select piece
      if (square.piece && square.piece.color === playerColor) {
        setSelectedSquare(square);
        setValidMoves(findValidMoves(square));
      }
    } else if (selectedSquare.coordinate === square.coordinate) {
      // Clicked the same square - deselect
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Try to move
      try {
        const from = selectedSquare.coordinate;
        const to = square.coordinate;
        
        // Check if it's a valid move
        if (validMoves.includes(to)) {
          const moveResult = chess.move({
            from: from as any,
            to: to as any,
            promotion: 'q' // Auto-promote to queen for simplicity
          });
          
          if (moveResult) {
            // Update the board
            setBoard(parseFenToBoard(chess.fen()));
            setLastMove([from, to]);
            setIsCheck(chess.inCheck());
            
            // Prepare move data
            const isCapture = moveResult.captured !== undefined;
            const isCheck = chess.inCheck();
            const isCheckmate = chess.isCheckmate();
            
            const moveData = {
              gameId: 0, // This will be set on the server
              moveNotation: moveResult.san,
              fenAfterMove: chess.fen(),
              pieceMoved: `${moveResult.color === 'w' ? 'white' : 'black'}_${moveResult.piece}`,
              fromSquare: from,
              toSquare: to,
              isCapture,
              isCheck,
              isCheckmate
            };
            
            // Save move to database
            await makeMove(gameCode, moveData);
            
            // Broadcast move to other players via socket
            sendMove(gameCode, moveData);
          }
        }
        
        // Reset selection
        setSelectedSquare(null);
        setValidMoves([]);
      } catch (error) {
        console.error('Invalid move:', error);
      }
    }
  };

  // Get chess piece symbol
  const getPieceSymbol = (piece: { type: string; color: string }): string => {
    const symbols = {
      k: { white: '♔', black: '♚' },
      q: { white: '♕', black: '♛' },
      r: { white: '♖', black: '♜' },
      b: { white: '♗', black: '♝' },
      n: { white: '♘', black: '♞' },
      p: { white: '♙', black: '♟' },
    };
    
    // Type assertion to fix TypeScript error
    return symbols[piece.type as keyof typeof symbols][piece.color as 'white' | 'black'];
  };

  // Flip board if playing as black
  const displayBoard = playerColor === 'black' 
    ? board.slice().reverse().map(rank => rank.slice().reverse()) 
    : board;

  return (
    <div className={cn('aspect-square w-full max-w-[600px] select-none', className)}>
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full border-2 border-neutral-800">
        {displayBoard.map((rank, rankIndex) =>
          rank.map((square, fileIndex) => {
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isSelected = selectedSquare?.coordinate === square.coordinate;
            const isValidMove = validMoves.includes(square.coordinate);
            const isLastMoveFrom = lastMove && lastMove[0] === square.coordinate;
            const isLastMoveTo = lastMove && lastMove[1] === square.coordinate;
            const isKingInCheck = isCheck && square.piece?.type === 'k' && square.piece?.color === chess.turn();

            return (
              <div
                key={square.coordinate}
                className={cn(
                  'relative transition-colors flex items-center justify-center cursor-pointer',
                  isLight ? 'bg-[#E8EDF9]' : 'bg-[#B7C0D8]',
                  isSelected && 'ring-2 ring-yellow-400 ring-inset z-10',
                  isValidMove && 'ring-2 ring-green-400 ring-inset',
                  (isLastMoveFrom || isLastMoveTo) && 'bg-yellow-100',
                  isKingInCheck && 'bg-red-200'
                )}
                onClick={() => handleSquareClick(square)}
              >
                {square.piece ? (
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center text-[calc(min(5vw,38px))] leading-none',
                    'transition-transform font-chess select-none',
                    square.piece.color === 'white' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.25)]',
                    isSelected && 'scale-110'
                  )}>
                    {getPieceSymbol(square.piece)}
                  </div>
                ) : isValidMove ? (
                  <div className="w-3 h-3 rounded-full bg-green-400 opacity-60" />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}