// TYPSICHERE DOM-ZUGRIFFE
// document.getElementById liefert HTMLElement | null. Wer .value lesen will,
// braucht die konkretere Klasse. instanceof prüft das zur Laufzeit wirklich,
// statt es mit "as" nur zu behaupten.

export function getSelect(id: string): HTMLSelectElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLSelectElement ? el : null;
}

export function getInput(id: string): HTMLInputElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLInputElement ? el : null;
}

export function getTextArea(id: string): HTMLTextAreaElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLTextAreaElement ? el : null;
}

/** Aus einem Event-Ziel ein Select machen -- e.target ist nur EventTarget | null. */
export function asSelect(target: EventTarget | null): HTMLSelectElement | null {
  return target instanceof HTMLSelectElement ? target : null;
}

/** Aus einem Event-Ziel ein Eingabefeld machen. */
export function asInput(target: EventTarget | null): HTMLInputElement | null {
  return target instanceof HTMLInputElement ? target : null;
}

/** Aus einem Event-Ziel ein Element machen -- e.target ist nur EventTarget | null. */
export function asElement(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement ? target : null;
}
