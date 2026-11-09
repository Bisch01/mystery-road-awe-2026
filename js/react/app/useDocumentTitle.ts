// Dokumenttitel synchron halten (Exercise 6, Demo 2).
//
// Der berechtigte Effect dieser Anwendung: document.title gehört dem
// Browser, nicht React. Es gibt keinen Weg, ihn aus JSX heraus zu setzen -
// also muss ihn jemand von außen zuweisen. Genau dafür ist ein Effect da:
// etwas außerhalb von React mit dem React-Zustand synchron halten.
//
// Die Abhängigkeit ist der fertige Titel, nicht der Pfad. Dadurch läuft die
// Zuweisung nur, wenn sich der Titel tatsächlich ändert - ein Wechsel von
// /team/people nach /team/people/nova-byte ändert den Titel nicht und
// löst den Effect deshalb auch nicht aus.

import { useEffect } from "react";

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
