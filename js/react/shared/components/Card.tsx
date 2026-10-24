// Generische Karten-Hülle: liefert nur den Kasten, nie Inhalt oder Daten.
// Die Komponente besitzt den Rahmen, der Aufrufer besitzt die Kinder
// (Skript Kap. 15.5: Komposition statt fester Props).
//
// Shared, weil zwei Features sie verwenden: people-locations (PersonCard,
// LocationCard) und dashboard (Panel, CaseSummaryCard).

import type { ReactNode } from "react";

interface CardProps {
  /** Variantenklasse für abweichende CSS-Regeln, z. B. "person-card". */
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={className ? `card ${className}` : "card"}>{children}</div>;
}
