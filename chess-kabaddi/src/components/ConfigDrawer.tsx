import { useGameStore } from "../store/gamestore";
import { Button } from "../ui/Button";

export function ConfigDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, setConfig, reset } = useGameStore();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-[380px] panel rounded-l-2xl p-5 shadow-soft transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-lg font-semibold">Settings</h3>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-neutral-400">
              First check move limit
            </label>
            <input
              type="range"
              min={4}
              max={20}
              value={state.config.firstCheckMoveLimit}
              onChange={(e) =>
                setConfig({ firstCheckMoveLimit: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-sm">
              {state.config.firstCheckMoveLimit} moves
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400">
              Defender points on timeout
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={state.config.pointsOnTimeout}
              onChange={(e) =>
                setConfig({ pointsOnTimeout: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-sm">{state.config.pointsOnTimeout} pts</div>
          </div>

          <div>
            <label className="text-sm text-neutral-400">
              Per-move points after first check
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={state.config.pointsPerMovePostCheck}
              onChange={(e) =>
                setConfig({ pointsPerMovePostCheck: Number(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-sm">
              {state.config.pointsPerMovePostCheck} / move
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <Button
              onClick={() => {
                reset();
                onClose();
              }}
              className="w-full"
            >
              Reset game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
