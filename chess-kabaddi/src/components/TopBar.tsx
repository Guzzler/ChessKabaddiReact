import { Settings } from "lucide-react";
import { Button } from "../ui/Button";

export function TopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chess Kabaddi</h1>
        <p className="text-sm text-neutral-400">
          Beautiful single‑player chase variant • no captures
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onOpen} variant="ghost">
          <Settings className="w-5 h-5" />{" "}
          <span className="sr-only">Settings</span>
        </Button>
        <a
          className="text-xs text-neutral-400 hover:text-neutral-200"
          href="https://firebase.google.com/docs/hosting"
          target="_blank"
        >
          Hosting
        </a>
      </div>
    </header>
  );
}
