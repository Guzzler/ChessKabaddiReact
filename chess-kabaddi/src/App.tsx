import { useState } from 'react'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Board } from './components/Board'
import { ConfigDrawer } from './components/ConfigDrawer'
import { RulesModal } from './components/RulesModal'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-full container py-6">
      <TopBar onOpen={() => setOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 mt-6">
        <div className="panel rounded-2xl p-4 shadow-soft">
          <Board />
        </div>
        <Sidebar />
      </div>

      <footer className="mt-8 text-xs text-neutral-400 text-center">
        Chess Kabaddi
      </footer>

      <ConfigDrawer open={open} onClose={() => setOpen(false)} />
      <RulesModal />
    </div>
  )
}
