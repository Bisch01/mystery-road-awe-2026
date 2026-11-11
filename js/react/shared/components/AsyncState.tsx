// Die drei asynchronen Zustände als eigene Komponenten (Exercise 6, Demo 6).
//
// Vorher war jeder dieser Fälle ein <p className="stub-note">. Drei
// verschiedene Lagen sahen damit gleich aus, und "leer" war von "lädt noch"
// nicht zu unterscheiden. Jetzt hat jeder Fall eine eigene Komponente, eine
// eigene Klasse und eine eigene ARIA-Rolle:
//
//   lädt    -> role="status",  Spinner, höflich angekündigt
//   Fehler  -> role="alert",   rot, mit technischem Detail und Ausweg
//   leer    -> role="status",  grau, erklärt WARUM nichts da ist
//
// Keine dieser Komponenten kennt Falldaten. Sie bekommen Text und einen
// optionalen Rückruf - mehr nicht.

import type { ReactNode } from "react";

interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="async-state async-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  /** Technisches Detail, z. B. "GET /api/evidence: HTTP 500". */
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="async-state async-error" role="alert">
      <strong>{title}</strong>
      <p className="async-detail">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          Erneut versuchen
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  hint: string;
  children?: ReactNode;
}

export function EmptyState({ title, hint, children }: EmptyStateProps) {
  return (
    <div className="async-state async-empty" role="status">
      <strong>{title}</strong>
      <p className="async-detail">{hint}</p>
      {children}
    </div>
  );
}
