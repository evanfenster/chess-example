export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type Square = {
  file: string;
  rank: string;
  piece: ChessPiece | null;
};

export type BoardState = Square[][];

export const initialBoardState: BoardState = Array(8)
  .fill(null)
  .map((_, rankIndex) => {
    return Array(8)
      .fill(null)
      .map((_, fileIndex) => {
        const file = String.fromCharCode(97 + fileIndex);
        const rank = String(8 - rankIndex);
        let piece: ChessPiece | null = null;

        if (rankIndex === 1) {
          piece = { type: 'pawn', color: 'black' };
        } else if (rankIndex === 6) {
          piece = { type: 'pawn', color: 'white' };
        } else if (rankIndex === 0 || rankIndex === 7) {
          const color = rankIndex === 0 ? 'black' : 'white';
          const type: PieceType = (() => {
            switch (fileIndex) {
              case 0:
              case 7:
                return 'rook';
              case 1:
              case 6:
                return 'knight';
              case 2:
              case 5:
                return 'bishop';
              case 3:
                return 'queen';
              case 4:
                return 'king';
              default:
                return 'pawn';
            }
          })();
          piece = { type, color };
        }

        return {
          file,
          rank,
          piece,
        };
      });
  });