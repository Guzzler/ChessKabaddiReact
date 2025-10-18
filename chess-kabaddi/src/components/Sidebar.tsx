import { useGameStore } from '../store/gamestore'
import { Button } from '../ui/Button'
import { endState } from '../libs/chesskabaddi'

export function Sidebar() {
  const { state, reset } = useGameStore()
  const end = endState(state)

  const label = end.over
    ? (end.result==='timeout' ? 'Defender wins (timeout)' : end.result==='checkmate' ? 'Attacker wins (checkmate)' : 'Draw (stalemate)')
    : state.checked ? 'Check!' : 'Playing…'

  return (
    <aside className="panel rounded-2xl p-4 shadow-soft space-y-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-neutral-400">Status</div>
        <div className="text-lg font-medium">{label}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="panel rounded-xl p-3">
          <div className="text-xs text-neutral-400">Defender points</div>
          <div className="text-2xl font-semibold">{state.defenderPoints}</div>
        </div>
        <div className="panel rounded-xl p-3">
          <div className="text-xs text-neutral-400">Moves left to first check</div>
          <div className="text-2xl font-semibold">{Math.max(0, state.config.firstCheckMoveLimit - state.moveCount)}</div>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-neutral-400">Moves</div>
        <div className="mt-2 max-h-64 overflow-auto space-y-1 pr-1">
          {state.history.slice().reverse().map((h,i)=> (
            <div key={i} className="text-sm text-neutral-300/90">{h}</div>
          ))}
        </div>
      </div>

      <Button onClick={reset} className="w-full">Reset</Button>

      <p className="text-xs text-neutral-400 leading-relaxed">
        <strong>Level:</strong> {state.config.level} • board {state.size}×{state.size} • captures {state.config.capturesAllowed? 'on':'off'}
      </p>
    </aside>
  )
}
