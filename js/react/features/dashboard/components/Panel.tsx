// Dashboard-Panel: Karten-Hülle plus Überschrift.
// Der Kasten kommt von <Card>, die Überschrift ist die Zutat dieses Features.
// title bleibt hier und wandert NICHT in Card: sonst müssten PersonCard und
// LocationCard einen Prop mitschleppen, den sie nie brauchen.

import type { ReactNode } from "react";
import { Card } from "../../../shared/components/Card.js";

interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <Card className="dashboard-panel">
      <h3>{title}</h3>
      {children}
    </Card>
  );
}
