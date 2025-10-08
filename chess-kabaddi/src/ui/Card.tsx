import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="panel rounded-2xl p-4 shadow-soft">{children}</div>;
}
