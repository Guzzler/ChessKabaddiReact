import { useMemo } from "react";
import { useGameStore } from "../store/gamestore";
import {
  movesFor,
  isWhiteInCheck,
} from "../libs/chesskabaddi";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function symbol(type: "king" | "knight" | "bishop", color: "white" | "black") {
  const map = {
    white: { king: "♔", knight: "♘", bishop: "♗" },
    black: { king: "♚", knight: "♞", bishop: "♝" },
  } as const;
  return map[color][type];
}

export function Board() {
  const { state, selectedId, select, moveTo } = useGameStore();

  const selected = state.pieces.find((p) => p.id === selectedId);
  const legal = useMemo(
    () => (selected ? movesFor(state, selected) : []),
    [state, selectedId]
  );
  const whiteInCheck = isWhiteInCheck(state);

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="grid grid-cols-8 aspect-square rounded-2xl overflow-hidden shadow-soft">
        {Array.from({ length: 8 }).map((_, y) =>
          Array.from({ length: 8 }).map((_, x) => {
            const dark = (x + y) % 2 === 1;
            const here = state.pieces.find(
              (p) => p.pos.x === x && p.pos.y === y
            );
            const hl = selected && legal.some((m) => m.x === x && m.y === y);
            const isCheckSquare =
              whiteInCheck &&
              state.pieces.find((p) => p.type === "king" && p.color === "white")
                ?.pos.x === x &&
              state.pieces.find((p) => p.type === "king" && p.color === "white")
                ?.pos.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={`square ${dark ? "dark" : "light"} ${
                  hl ? "highlight" : ""
                } ${isCheckSquare ? "check" : ""}`}
                onClick={() => {
                  if (
                    here &&
                    state.turn === "attacker" &&
                    here.color === "black"
                  ) {
                    select(here.id);
                  } else if (selected) {
                    moveTo(x, y);
                  }
                }}
                style={{ aspectRatio: "1/1" }}
              >
                {/* piece */}
                {here && (
                  <div
                    className={`chess-piece ${
                      here.color === "black" ? "piece-black" : "piece-white"
                    }`}
                  >
                    {symbol(here.type, here.color)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* coords */}
      <div className="mt-2 flex justify-between text-xs text-neutral-400 px-1">
        {FILES.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
    </div>
  );
}
