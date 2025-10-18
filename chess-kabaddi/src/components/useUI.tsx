import { create } from 'zustand'

export const useUI = create<{ rulesOpen: boolean; setRulesOpen: (v:boolean)=>void }>((set)=>({
  rulesOpen: true,
  setRulesOpen: (v)=> set({ rulesOpen: v })
}))
