import { create } from "zustand";
import type { GameState, Piece } from "../libs/types";
import { applyMove, endState, isWhiteInCheck } from "../libs/chesskabaddi";
import { defenderAIMove } from "../libs/ai";

function id(s: string) {
  return s + Math.random().toString(36).slice(2, 7);
}

const initialPieces: Piece[] = [
  { id: id("n1"), type: "knight", color: "black", pos: { x: 5, y: 4 } },
  { id: id("n2"), type: "knight", color: "black", pos: { x: 3, y: 6 } },
  { id: id("b1"), type: "bishop", color: "black", pos: { x: 6, y: 6 } },
  { id: id("k"), type: "king", color: "white", pos: { x: 0, y: 0 } },
];

const initialState: GameState = {
  size: 8,
  turn: "attacker",
  moveCount: 0,
  defenderPoints: 0,
  pieces: initialPieces,
  checked: false,
  history: [],
  config: {
    firstCheckMoveLimit: 10,
    pointsOnTimeout: 50,
    pointsPerMovePostCheck: 1,
  },
};

export const useGameStore = create<{
  state: GameState;
  selectedId?: string;
  setConfig: (k: Partial<GameState["config"]>) => void;
  reset: () => void;
  select: (id?: string) => void;
  moveTo: (x: number, y: number) => void;
}>((set, get) => ({
  state: { ...initialState },
  selectedId: undefined,
  setConfig: (k) =>
    set((s) => ({
      state: { ...s.state, config: { ...s.state.config, ...k } },
    })),
  reset: () =>
    set(() => ({
      state: JSON.parse(JSON.stringify(initialState)),
      selectedId: undefined,
    })),
  select: (id) => set(() => ({ selectedId: id })),
  moveTo: (x, y) => {
    const { state, selectedId } = get();
    if (!selectedId) return;

    // Apply human(move), then possibly AI(move)
    let next = applyMove(state, selectedId, { x, y });

    // Update defender points after first check
    if (next.firstCheckMove !== undefined && next.turn === "defender") {
      // (points awarded per defender *move*; will add after AI actually moves)
    }

    const end = endState(next);
    set({ state: next, selectedId: undefined });

    if (!end.over && next.turn === "defender") {
      setTimeout(() => {
        const { state: cur } = get();
        const dest = defenderAIMove(cur);
        if (!dest) return;
        let afterAI = applyMove(
          cur,
          cur.pieces.find((p) => p.type === "king" && p.color === "white")!.id,
          dest
        );

        // Points after the defender actually survived this move
        if (afterAI.firstCheckMove !== undefined) {
          afterAI.defenderPoints += afterAI.config.pointsPerMovePostCheck;
        }

        afterAI.checked = isWhiteInCheck(afterAI);
        const end2 = endState(afterAI);
        set({ state: afterAI });
        if (end2.over) {
          // optionally surface a modal via UI
        }
      }, 380);
    }
  },
}));
