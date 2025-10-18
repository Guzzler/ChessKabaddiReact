import { create } from 'zustand'
import type { GameState, Piece, Level } from '../libs/types'
import { applyMove, endState, isWhiteInCheck } from '../libs/chesskabaddi'
import { defenderAIMove } from '../libs/ai'

function id(s:string){ return s+Math.random().toString(36).slice(2,7) }

function preset(level: Level): { pieces: Piece[]; size: number; capturesAllowed: boolean } {
  if (level==='easy') {
    return {
      size: 7,
      capturesAllowed: false,
      pieces: [
        { id:id('n1'), type:'knight', color:'black', pos:{x:4,y:3} },
        { id:id('n2'), type:'knight', color:'black', pos:{x:2,y:5} },
        { id:id('b1'), type:'bishop', color:'black', pos:{x:6,y:5} },   // moved off king's diagonal
        { id:id('k'),  type:'king',   color:'white', pos:{x:1,y:1} },   // king not in check at start
      ]
    }
  }
  if (level==='medium') {
    return {
      size: 8,
      capturesAllowed: true,
      pieces: [
        { id:id('n1'), type:'knight', color:'black', pos:{x:5,y:4} },
        { id:id('n2'), type:'knight', color:'black', pos:{x:3,y:6} },
        { id:id('b1'), type:'bishop', color:'black', pos:{x:6,y:5} },   // moved off (0,0) diagonal
        { id:id('k'),  type:'king',   color:'white', pos:{x:1,y:1} },
        { id:id('r'),  type:'rook',   color:'white', pos:{x:0,y:7} },
      ]
    }
  }
  // hard
  return {
    size: 8,
    capturesAllowed: true,
    pieces: [
      { id:id('n1'), type:'knight', color:'black', pos:{x:5,y:4} },
      { id:id('n2'), type:'knight', color:'black', pos:{x:3,y:6} },
      { id:id('b1'), type:'bishop', color:'black', pos:{x:6,y:5} },     // moved off (0,0) diagonal
      { id:id('k'),  type:'king',   color:'white', pos:{x:1,y:1} },
      { id:id('r'),  type:'rook',   color:'white', pos:{x:0,y:7} },
      { id:id('n3'), type:'knight', color:'white', pos:{x:1,y:6} },
    ]
  }
}

const baseConfig = { firstCheckMoveLimit: 10, pointsOnTimeout: 50, pointsPerMovePostCheck: 1 }

function initialState(level: Level): GameState {
  const pre = preset(level)
  return {
    size: pre.size,
    turn: 'attacker',
    moveCount: 0,
    defenderPoints: 0,
    pieces: pre.pieces,
    checked: false,
    history: [],
    config: { level, boardSize: pre.size, capturesAllowed: pre.capturesAllowed, ...baseConfig },
  }
}

export const useGameStore = create<{
  state: GameState
  selectedId?: string
  setConfig: (k: Partial<GameState['config']>)=>void
  setLevel: (lvl: Level)=>void
  reset: ()=>void
  select: (id?: string)=>void
  moveTo: (x:number,y:number)=>void
}>((set,get)=>({
  state: initialState('easy'),
  selectedId: undefined,
  setConfig: (k)=> set(s=>({ state: { ...s.state, config: { ...s.state.config, ...k }, size: k.boardSize ?? s.state.size }})),
  setLevel: (lvl)=> set(()=>({ state: initialState(lvl) })),
  reset: ()=> set(s=>({ state: initialState(s.state.config.level), selectedId: undefined })),
  select: (id)=> set(()=>({ selectedId: id })),
  moveTo: (x,y) => {
    const { state, selectedId } = get()
    if (!selectedId) return

    let next = applyMove(state, selectedId, {x,y})

    const end = endState(next)
    set({ state: next, selectedId: undefined })

    if (!end.over && next.turn==='defender') {
      setTimeout(()=> {
        const { state: cur } = get()
        const ai = defenderAIMove(cur)
        if (!ai) return
        let afterAI = applyMove(cur, ai.piece.id, ai.to)

        if (afterAI.firstCheckMove!==undefined) {
          afterAI.defenderPoints += afterAI.config.pointsPerMovePostCheck
        }

        afterAI.checked = isWhiteInCheck(afterAI)
        const end2 = endState(afterAI)
        set({ state: afterAI })
        if (end2.over) {
          // status panel shows end result
        }
      }, 280)
    }
  }
}))
