
// NAVIGATION (nur der Hash-Wechsel)
//
// Bewusst von router.js getrennt: navigateTo hat keine Abhängigkeiten,
// handleHashChange dagegen importiert alle fünf Views. Lägen beide in
// derselben Datei, entstünde ein Import-Zyklus (views -> router -> views).


export function navigateTo(viewName) {
  window.location.hash = viewName;
  // handleHashChange() will pick this up via the hashchange listener
}