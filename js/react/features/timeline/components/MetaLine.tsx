// Beschriftete Meta-Zeile eines Zeitstrahl-Ereignisses.
//
// REIN DARSTELLEND: bekommt fertige Texte und entscheidet nur noch, ob
// überhaupt etwas gerendert wird. Kennt weder Personen noch Orte.

interface MetaLineProps {
  label: string;
  values: string[];
}

export function MetaLine({ label, values }: MetaLineProps) {
  if (values.length === 0) {
    return null;
  }

  return (
    <p className="evidence-meta">
      {label}: {values.join(", ")}
    </p>
  );
}
