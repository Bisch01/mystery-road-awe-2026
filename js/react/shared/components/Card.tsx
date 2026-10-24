// Generische Karten-Hülle. Nimmt KEINE Daten entgegen, sondern children

// Die Komponente besitzt den Kasten, der Aufrufer besitzt den Inhalt.

import type { ReactNode } from "react";

interface CardProps {
  /** Zusätzliche Klasse für variantenspezifische Regeln, z. B. "person-card". */
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={className ? `card ${className}` : "card"}>{children}</div>;
}
