import { Settings, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { useUI } from './useUI'

export function TopBar({ onOpen }: { onOpen: ()=>void }) {
  const { setRulesOpen } = useUI()
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chess Kabaddi</h1>
        <p className="text-sm text-neutral-400">Beautiful single-player chase variant • captures optional • levels</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={()=>setRulesOpen(true)}><Info className="w-5 h-5"/><span className="sr-only">Rules</span></Button>
        <Button onClick={onOpen} variant="ghost"><Settings className="w-5 h-5"/> <span className="sr-only">Settings</span></Button>
      </div>
    </header>
  )
}
