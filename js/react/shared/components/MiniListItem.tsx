// Ersetzt vier Stellen mini-list-item-Markup in dashboard.ts und workspace.ts.

import type { ReactNode } from "react";

interface MiniListItemProps {
  title: ReactNode;
  children?: ReactNode;
}

export function MiniListItem({ title, children }: MiniListItemProps) {
  return (
    <div className="mini-list-item">
      <strong>{title}</strong>
      {children}
    </div>
  );
}
