import type { GameState, Pos, Piece } from './types'
import { legalKingMoves, movesFor } from './chesskabaddi'

const VALUE: Record<string, number> = { knight: 3, bishop: 3, rook: 5 }
const dist = (a: Pos, b: Pos) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y)

function bestKingMove(state: GameState): Pos | null {
  const legal = legalKingMoves(state)
  if (!legal.length) return null
  const king = state.pieces.find(p=>p.type==='king' && p.color==='white')!
  const attackers = state.pieces.filter(p=>p.color==='black')
  let best = legal[0], score = -1e9
  for (const m of legal) {
    const mind = Math.min(...attackers.map(a=>dist(a.pos,m)))
    const cornerBonus = (m.x===0||m.x===state.size-1) && (m.y===0||m.y===state.size-1) ? 0.5 : 0
    const stayPenalty = (m.x===king.pos.x && m.y===king.pos.y) ? -2 : 0
    const s = mind + cornerBonus + stayPenalty
    if (s>score) { score=s; best=m }
  }
  return best
}

export function defenderAIMove(state: GameState): { piece: Piece, to: Pos } | null {
  // Consider moves for ALL white pieces; pick the one with highest score.
  const whites = state.pieces.filter(p=>p.color==='white')
  type Candidate = { piece: Piece; to: Pos; score: number }
  const cands: Candidate[] = []

  for (const w of whites) {
    const legal = w.type==='king' ? (bestKingMove(state)? [bestKingMove(state)!] : []) : movesFor(state, w)
    for (const to of legal) {
      // simple score: prefer captures and king safety
      let score = 0
      const target = state.pieces.find(p=>p.pos.x===to.x && p.pos.y===to.y)
      if (target && target.color==='black') score += (VALUE[target.type]||1)*5
      if (w.type==='king') score += 2 // nudge to move king if it can
      // distance from nearest attacker (after move)
      const attackers = state.pieces.filter(p=>p.color==='black')
      const mind = Math.min(...attackers.map(a=>dist(a.pos,to)))
      score += mind*0.6
      cands.push({ piece: w, to, score })
    }
  }

  if (!cands.length) return null
  cands.sort((a,b)=>b.score-a.score)
  return { piece: cands[0].piece, to: cands[0].to }
}
