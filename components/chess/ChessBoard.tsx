'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BoardState, ChessPiece, Square, initialBoardState } from '@/lib/chess/types';

interface ChessBoardProps {
  className?: string;
}

export function ChessBoard({ className }: ChessBoardProps) {
  const [board, setBoard] = useState<BoardState>(initialBoardState);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const handleSquareClick = (square: Square) => {
    if (!selectedSquare) {
      if (square.piece) {
        setSelectedSquare(square);
      }
    } else {
      if (selectedSquare !== square) {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(rank => rank.map(s => ({ ...s })));
          const [fromRank, fromFile] = findSquarePosition(newBoard, selectedSquare);
          const [toRank, toFile] = findSquarePosition(newBoard, square);
          newBoard[toRank][toFile].piece = newBoard[fromRank][fromFile].piece;
          newBoard[fromRank][fromFile].piece = null;
          return newBoard;
        });
      }
      setSelectedSquare(null);
    }
  };

  const findSquarePosition = (board: BoardState, square: Square): [number, number] => {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        if (board[rank][file].file === square.file && board[rank][file].rank === square.rank) {
          return [rank, file];
        }
      }
    }
    return [0, 0];
  };

  const getPieceSymbol = (piece: ChessPiece): string => {
    const symbols: Record<string, { white: string; black: string }> = {
      king: { white: '♔', black: '♚' },
      queen: { white: '♕', black: '♛' },
      rook: { white: '♖', black: '♜' },
      bishop: { white: '♗', black: '♝' },
      knight: { white: '♘', black: '♞' },
      pawn: { white: '♙', black: '♟' },
    };
    return symbols[piece.type][piece.color];
  };

  return (
    <div className={cn('aspect-square w-full max-w-[600px] select-none', className)}>
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full border-2 border-neutral-800">
        {board.map((rank, rankIndex) =>
          rank.map((square, fileIndex) => {
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isSelected = selectedSquare?.file === square.file && 
                             selectedSquare?.rank === square.rank;

            return (
              <div
                key={`${square.file}${square.rank}`}
                className={cn(
                  'relative transition-colors flex items-center justify-center cursor-pointer',
                  'before:content-[""] before:pb-[100%] before:float-left',
                  isLight ? 'bg-[#E8EDF9]' : 'bg-[#B7C0D8]',
                  isSelected && 'ring-2 ring-yellow-400 ring-inset z-10'
                )}
                onClick={() => handleSquareClick(square)}
              >
                {square.piece && (
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center text-[calc(min(5vw,38px))] leading-none',
                    'transition-transform font-chess select-none',
                    square.piece.color === 'white' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.25)]',
                    isSelected && 'scale-110'
                  )}>
                    {getPieceSymbol(square.piece)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}