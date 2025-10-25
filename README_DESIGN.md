# Design system – Dashboard

Ce mini design system introduit une palette cohérente pour les écrans dashboard côté client et admin.

## Principes
- Hiérarchie typographique claire : échelles 12/14/16/20/24/32 px.
- Rythme vertical basé sur une grille 8px (variables `--space-*`).
- Coins arrondis modérés (`--radius-sm` à 6px, `--radius-md` à 10px).
- Ombres sobres (`--elevation-*`) pour hiérarchiser les surfaces.
- Contrastes conformes WCAG AA (texte principal ≥ #1F2937 sur fond clair).
- Responsive de 320px à 1440px via grilles fluides.
- Accessibilité : zones cliquables ≥ 44px, focus visibles, aria-live sur contenus dynamiques.
- Thèmes clair/sombre via `data-theme` sur `<body>`.

## Tokens
Les tokens se trouvent dans `src/styles/tokens.css` et sont exposés via variables CSS :

| Catégorie | Variables |
|-----------|-----------|
| Espacements | `--space-0` → `--space-9` |
| Rayons | `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill` |
| Ombres | `--elevation-1`, `--elevation-2`, `--elevation-3` |
| Couleurs marque | `--brand-primary`, `--brand-accent`, `--brand-warning`, `--brand-success`, `--brand-info` |
| Texte | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse` |
| Fonds | `--bg-canvas`, `--bg-surface`, `--bg-subtle`, `--bg-elevated`, `--bg-overlay` |
| Bordures | `--border-strong`, `--border-subtle` |
| Focus | `--focus-ring` |

La variante sombre est définie via `[data-theme="dark"]`.

## Composants
- `StatCard` : carte KPI, accepte icône, tendance, état de chargement (aria-live).
- `DataTable` : tableau triable avec pagination, état vide riche via `EmptyState`.
- `EmptyState` : illustration + titre + paragraphe + CTA secondaire.
- `Sidebar` : navigation élargie/compacte, mobile overlay, items actifs marqués.
- `Header` : en-tête page avec actions, bascule thème, notifications, avatar.

## Bonnes pratiques
- Utiliser les variables CSS via utilitaires Tailwind arbitraires (`bg-[color:var(--bg-surface)]`).
- Conserver des marges/paddings multiples de `--space-*`.
- Préférer les helpers `formatCurrencyEUR` et `formatDateFR` pour les formats FR.
- Exposer le thème souhaité en appliquant `document.body.dataset.theme = "dark" | "light"`.
