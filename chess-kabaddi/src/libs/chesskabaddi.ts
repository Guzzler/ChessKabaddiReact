import type { Piece, Pos, GameState } from './types'

export const inside = (p: Pos, size=8) => p.x >= 0 && p.x < size && p.y >= 0 && p.y < size
export const same = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y

export function cloneState<T>(s: T): T { return JSON.parse(JSON.stringify(s)) }

export function pieceAt(state: GameState, pos: Pos) {
  return state.pieces.find(p => same(p.pos, pos))
}

export function movesFor(state: GameState, piece: Piece): Pos[] {
  const size = state.size
  const occ = (p: Pos) => pieceAt(state, p)
  const out: Pos[] = []

  const push = (p: Pos) => {
    if (!inside(p, size)) return false
    const t = occ(p)
    if (!t) { out.push(p); return true } // empty
    if (t.color !== piece.color && state.config.capturesAllowed) { out.push(p); return false } // capture and stop
    return false // same color or captures not allowed
  }

  if (piece.type === 'knight') {
    const deltas = [
      {x:1,y:2},{x:2,y:1},{x:-1,y:2},{x:-2,y:1},
      {x:1,y:-2},{x:2,y:-1},{x:-1,y:-2},{x:-2,y:-1},
    ]
    for (const d of deltas) push({ x: piece.pos.x + d.x, y: piece.pos.y + d.y })
  }

  if (piece.type === 'bishop' || piece.type === 'rook') {
    const rays: [number,number][] = piece.type==='bishop'
      ? [[1,1],[1,-1],[-1,1],[-1,-1]]
      : [[1,0],[-1,0],[0,1],[0,-1]]
    for (const [dx,dy] of rays) {
      for (let i=1;i<size;i++) {
        const p = { x: piece.pos.x + dx*i, y: piece.pos.y + dy*i }
        if (!push(p)) break
      }
    }
  }

  if (piece.type === 'king') {
    for (let dx=-1; dx<=1; dx++)
      for (let dy=-1; dy<=1; dy++) {
        if (dx===0 && dy===0) continue
        push({ x: piece.pos.x + dx, y: piece.pos.y + dy })
      }
  }
  return out
}

export function squaresAttackedByBlack(state: GameState): Pos[] {
  const black = state.pieces.filter(p => p.color==='black')
  const out: Pos[] = []
  const size = state.size

  const add = (p:Pos)=> { if (inside(p,size)) out.push(p) }

  for (const p of black) {
    if (p.type === 'knight') {
      [{x:1,y:2},{x:2,y:1},{x:-1,y:2},{x:-2,y:1},{x:1,y:-2},{x:2,y:-1},{x:-1,y:-2},{x:-2,y:-1}]
        .forEach(d=>add({x:p.pos.x+d.x,y:p.pos.y+d.y}))
    } else if (p.type === 'bishop' || p.type==='rook') {
      const rays: [number,number][] = p.type==='bishop'
        ? [[1,1],[1,-1],[-1,1],[-1,-1]] : [[1,0],[-1,0],[0,1],[0,-1]]
      for (const [dx,dy] of rays) {
        for (let i=1;i<size;i++) {
          const q = {x:p.pos.x+dx*i, y:p.pos.y+dy*i}
          if (!inside(q,size)) break
          out.push(q)
          if (pieceAt(state,q)) break
        }
      }
    } else if (p.type==='king') {
      for (let dx=-1; dx<=1; dx++) for (let dy=-1; dy<=1; dy++)
        if (dx||dy) add({x:p.pos.x+dx,y:p.pos.y+dy})
    }
  }
  // dedupe
  const map = new Map(out.map(p=>[`${p.x},${p.y}`,p]))
  return [...map.values()]
}

export function isWhiteInCheck(state: GameState) {
  const k = state.pieces.find(p=>p.type==='king' && p.color==='white')!
  return squaresAttackedByBlack(state).some(a=>same(a,k.pos))
}

export function legalKingMoves(state: GameState): Pos[] {
  const k = state.pieces.find(p=>p.type==='king' && p.color==='white')!
  const cand = movesFor(state, k)
  const attacked = squaresAttackedByBlack(state)
  return cand.filter(c=>!attacked.some(a=>same(a,c)))
}

export function applyMove(state: GameState, pieceId: string, to: Pos): GameState {
  const s = cloneState(state)
  const p = s.pieces.find(p=>p.id===pieceId)!

  // capture if enemy on target
  const tgt = pieceAt(s, to)
  if (tgt && tgt.color!==p.color && s.config.capturesAllowed) {
    s.pieces = s.pieces.filter(pp=>pp.id!==tgt.id)
  } else if (tgt) {
    // illegal (occupied by same color or captures off)
    return s
  }

  const from = { ...p.pos }
  p.pos = to

  if (p.color==='black') s.moveCount += 1

  s.checked = isWhiteInCheck(s)
  if (s.checked && s.firstCheckMove===undefined) s.firstCheckMove = s.moveCount

  if (s.firstCheckMove===undefined && s.moveCount>=s.config.firstCheckMoveLimit) {
    s.defenderPoints = s.config.pointsOnTimeout
  }

  s.history.push(`${p.color==='black'? 'B':'W'}:${p.type[0].toUpperCase()}${p.pos.x}${p.pos.y}`)
  s.lastMove = { from, to }
  s.turn = s.turn==='attacker'? 'defender':'attacker'
  return s
}

export function endState(state: GameState) {
  const legal = legalKingMoves(state)
  const inCheck = isWhiteInCheck(state)
  const noMoves = legal.length===0
  if (state.defenderPoints>=state.config.pointsOnTimeout) return { over: true, result: 'timeout' as const }
  if (noMoves && inCheck) return { over: true, result: 'checkmate' as const }
  if (noMoves && !inCheck) return { over: true, result: 'stalemate' as const }
  return { over: false as const }
}
