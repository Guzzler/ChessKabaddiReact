import { useUI } from './useUI'

export function RulesModal() {
  const { rulesOpen, setRulesOpen } = useUI()
  if (!rulesOpen) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={()=>setRulesOpen(false)} />
      <div className="absolute inset-x-0 top-10 mx-auto max-w-xl panel rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-2">How to play</h3>
        <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-2">
          <li>You are the <strong>Attacker</strong> (black): two Knights + one Bishop.</li>
          <li>Defender (white) has at least a <strong>King</strong>, and on higher levels also a <strong>Rook</strong> and a <strong>Knight</strong>.</li>
          <li>Deliver the <strong>first check</strong> within the move limit. If you fail, Defender instantly scores the timeout points.</li>
          <li>After the first check, Defender scores <em>per move survived</em> until mate or stalemate.</li>
          <li>Depending on level, <strong>captures</strong> may be enabled. When on, standard chess captures apply.</li>
        </ol>
        <div className="text-xs text-neutral-400 mt-3">Tip: tap a black piece to see legal moves. Blue dot = move, red frame = capture, red glow on King = check.</div>
        <div className="mt-4 text-right">
          <button className="rounded-xl px-4 py-2 bg-brand-600 hover:bg-brand-700" onClick={()=>setRulesOpen(false)}>Got it</button>
        </div>
      </div>
    </div>
  )
}
