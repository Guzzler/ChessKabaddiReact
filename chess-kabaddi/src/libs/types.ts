export type Color = 'white' | 'black'
export type PieceType = 'king' | 'knight' | 'bishop' | 'rook'
export type Pos = { x: number; y: number }

export type Piece = { id: string; type: PieceType; color: Color; pos: Pos }

export type Level = 'easy' | 'medium' | 'hard'

export type Config = {
  level: Level
  boardSize: number
  capturesAllowed: boolean
  firstCheckMoveLimit: number
  pointsOnTimeout: number
  pointsPerMovePostCheck: number
}

export type GameState = {
  size: number
  turn: 'attacker' | 'defender'
  moveCount: number
  firstCheckMove?: number
  defenderPoints: number
  pieces: Piece[]
  checked: boolean
  history: string[]
  lastMove?: { from: Pos; to: Pos }
  config: Config
}
