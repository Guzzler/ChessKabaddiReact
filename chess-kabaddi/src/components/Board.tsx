import { useMemo } from 'react'
import { useGameStore } from '../store/gamestore'
import { movesFor, isWhiteInCheck } from '../libs/chesskabaddi'

const FILES = ['a','b','c','d','e','f','g','h','i'] // supports up to 9x9 later

function symbol(type: 'king'|'knight'|'bishop'|'rook', color: 'white'|'black') {
  const map = {
    white: { king: '♔', knight: '♘', bishop: '♗', rook: '♖' },
    black: { king: '♚', knight: '♞', bishop: '♝', rook: '♜' },
  } as const
  return map[color][type]
}

export function Board() {
  const { state, selectedId, select, moveTo } = useGameStore()
  const size = state.size

  const selected = state.pieces.find(p=>p.id===selectedId)
  const legal = useMemo(()=> selected? movesFor(state, selected): [], [state, selectedId])
  const whiteInCheck = isWhiteInCheck(state)

  return (
    <div className="mx-auto w-full max-w-[min(88vw,760px)]">
      <div className="grid" style={{gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`}}>
        {Array.from({length:size}).map((_,y)=> Array.from({length:size}).map((_,x)=> {
          const dark = (x+y)%2===1
          const here = state.pieces.find(p=>p.pos.x===x && p.pos.y===y)
          const isSel = !!selected && selected.pos.x===x && selected.pos.y===y
          const canMove = selected && legal.some(m=>m.x===x && m.y===y)
          const capture = canMove && !!here && here.color!==selected!.color
          const isCheckSquare = whiteInCheck && state.pieces.find(p=>p.type==='king' && p.color==='white')?.pos.x===x && state.pieces.find(p=>p.type==='king' && p.color==='white')?.pos.y===y
          const isLast = state.lastMove && state.lastMove.to.x===x && state.lastMove.to.y===y

          return (
            <div key={`${x}-${y}`} className={`square aspect-square ${dark? 'dark':'light'} ${isSel? 'sel':''} ${canMove? (capture?'capture':'legal'):''} ${isCheckSquare? 'check':''} ${isLast? 'last':''}`}
              onClick={()=> {
                if (here && state.turn==='attacker' && here.color==='black') {
                  select(here.id)
                } else if (selected) {
                  moveTo(x,y)
                }
              }}>
              {here && (
                <div className={`piece ${here.color}`}>{symbol(here.type, here.color)}</div>
              )}
            </div>
          )
        }))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-neutral-400 px-1">
        {Array.from({length:size}).map((_,i)=> <span key={i}>{FILES[i]}</span>)}
      </div>
    </div>
  )
}
