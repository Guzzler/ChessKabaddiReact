import type { Piece, Pos, GameState } from "./types";

export const inside = (p: Pos) => p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 8;
export const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y;

export function cloneState(s: GameState): GameState {
  return JSON.parse(JSON.stringify(s));
}

export function pieceAt(state: GameState, pos: Pos) {
  return state.pieces.find((p) => same(p.pos, pos));
}

export function pathBlocked(state: GameState, from: Pos, to: Pos) {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let x = from.x + dx,
    y = from.y + dy;
  while (x !== to.x || y !== to.y) {
    if (pieceAt(state, { x, y })) return true;
    x += dx;
    y += dy;
  }
  return false;
}

export function movesFor(state: GameState, piece: Piece): Pos[] {
  const occ = (p: Pos) => !!pieceAt(state, p);
  const out: Pos[] = [];

  if (piece.type === "knight") {
    const deltas = [
      { x: 1, y: 2 },
      { x: 2, y: 1 },
      { x: -1, y: 2 },
      { x: -2, y: 1 },
      { x: 1, y: -2 },
      { x: 2, y: -1 },
      { x: -1, y: -2 },
      { x: -2, y: -1 },
    ];
    for (const d of deltas) {
      const p = { x: piece.pos.x + d.x, y: piece.pos.y + d.y };
      if (inside(p) && !occ(p)) out.push(p);
    }
  }

  if (piece.type === "bishop") {
    const rays = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ] as const;
    for (const [dx, dy] of rays) {
      for (let i = 1; i < 8; i++) {
        const p = { x: piece.pos.x + dx * i, y: piece.pos.y + dy * i };
        if (!inside(p)) break;
        if (occ(p)) break;
        out.push(p);
      }
    }
  }

  if (piece.type === "king") {
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const p = { x: piece.pos.x + dx, y: piece.pos.y + dy };
        if (inside(p) && !occ(p)) out.push(p);
      }
  }
  return out;
}

export function squaresAttackedByBlack(state: GameState): Pos[] {
  const black = state.pieces.filter((p) => p.color === "black");
  const out: Pos[] = [];
  for (const p of black) {
    if (p.type === "knight") {
      const deltas = [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: -1, y: 2 },
        { x: -2, y: 1 },
        { x: 1, y: -2 },
        { x: 2, y: -1 },
        { x: -1, y: -2 },
        { x: -2, y: -1 },
      ];
      deltas.forEach((d) => {
        const q = { x: p.pos.x + d.x, y: p.pos.y + d.y };
        if (inside(q)) out.push(q);
      });
    } else if (p.type === "bishop") {
      const rays = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const;
      for (const [dx, dy] of rays) {
        for (let i = 1; i < 8; i++) {
          const q = { x: p.pos.x + dx * i, y: p.pos.y + dy * i };
          if (!inside(q)) break;
          if (pieceAt(state, q)) {
            // blocked by any piece
            // bishop attacks up to the first occupied square (king would be checked if it stood there)
            out.push(q);
            break;
          }
          out.push(q);
        }
      }
    }
  }
  // dedupe
  const key = (p: Pos) => `${p.x},${p.y}`;
  const map = new Map<string, Pos>();
  out.forEach((p) => map.set(key(p), p));
  return [...map.values()];
}

export function isWhiteInCheck(state: GameState) {
  const k = state.pieces.find((p) => p.type === "king" && p.color === "white")!;
  const attacked = squaresAttackedByBlack(state);
  return attacked.some((a) => same(a, k.pos));
}

export function legalKingMoves(state: GameState): Pos[] {
  const k = state.pieces.find((p) => p.type === "king" && p.color === "white")!;
  const candidates = movesFor(state, k);
  const attacked = squaresAttackedByBlack(state);
  return candidates.filter((c) => !attacked.some((a) => same(a, c)));
}

export function applyMove(
  state: GameState,
  pieceId: string,
  to: Pos
): GameState {
  const s = cloneState(state);
  const p = s.pieces.find((p) => p.id === pieceId)!;
  p.pos = to;

  // update moveCount for attacker
  if (p.color === "black") s.moveCount += 1;

  // check status
  s.checked = isWhiteInCheck(s);

  // first check bookkeeping
  if (s.checked && s.firstCheckMove === undefined) {
    s.firstCheckMove = s.moveCount;
  }

  // scoring
  if (
    s.firstCheckMove === undefined &&
    s.moveCount >= s.config.firstCheckMoveLimit
  ) {
    // timeout: defender earns max points immediately, and game ends via flag
    s.defenderPoints = s.config.pointsOnTimeout;
  }

  // create notation
  const mark = p.type[0].toUpperCase();
  s.history.push(
    `${p.color === "black" ? "B" : "W"}:${mark}${p.pos.x}${p.pos.y}`
  );

  // switch turn
  s.turn = s.turn === "attacker" ? "defender" : "attacker";
  return s;
}

export function endState(state: GameState) {
  const legal = legalKingMoves(state);
  const inCheck = isWhiteInCheck(state);
  const noMoves = legal.length === 0;
  if (state.defenderPoints >= state.config.pointsOnTimeout)
    return { over: true, result: "timeout" as const };
  if (noMoves && inCheck) return { over: true, result: "checkmate" as const };
  if (noMoves && !inCheck) return { over: true, result: "stalemate" as const };
  return { over: false as const };
}
