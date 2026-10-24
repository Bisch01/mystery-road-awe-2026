// Layout-Hülle mit Überschrift. Nutzt children (Skript Kap. 15.5:
// Komposition statt fester Props, wenn der Inhalt beliebig sein darf).

import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <div className="dashboard-panel">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
