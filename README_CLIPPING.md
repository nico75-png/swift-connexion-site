# Règles "No-Clip"

## Pourquoi éviter `overflow: hidden`
- Couper le débordement masque les focus outlines, les messages d'erreur et les tooltips.
- Un parent flex/grid avec `overflow: hidden` crée des "scroll jail" : la page ne peut plus scroller.
- À conserver uniquement pour les vignettes, avatars et masques visuels intentionnels.

**À faire :**
- Préférer `overflow: clip` pour les animations décoratives.
- Ajouter la classe utilitaire `.no-clip` si un composant hérite d'un overflow agressif.

## Le duo `min-width: 0` / `min-height: 0`
- Les enfants flex ou grid ont une largeur/hauteur minimale automatique qui force le débordement.
- Ajouter `min-width: 0` (ou `.minw0`) et `min-height: 0` (ou `.minh0`) sur les colonnes, cartes et wrappers de contenu.
- Sans cette règle, les textes longs, montants EUR ou i18n cassent la mise en page.

## Diagnostiquer les clips
1. Inspecter l'élément dans DevTools, onglet **Layout**.
2. Vérifier `clientHeight` vs `scrollHeight` : si `scroll` > `client`, mais pas de scrollbar → clip !
3. Utiliser le raccourci **Tab** pour valider que tous les focus sont visibles.
4. Tester avec zoom 200 % et viewport mobile (360px) : aucun contenu ne doit être mangé.

## Utilitaires anti-clipping
- `.wrap-any` force les retours à la ligne sur les identifiants ou valeurs longues.
- `.scroll-x` crée un overflow horizontal accessible, sans capturer le scroll vertical.
- `.safe-area` applique les marges `env(safe-area-inset-*)` pour les appareils avec notch.
- Les tokens `--z-base`, `--z-sticky`, `--z-modal`, etc. garantissent des overlays hiérarchisés.

Gardez ces règles en tête lors de toute nouvelle mise en page ou refonte.
