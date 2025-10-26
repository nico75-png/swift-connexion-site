> 🔒 Version stable : validée et fusionnée avec `main` le 26/10/2025

# 🤖 AGENTS.md — Manuel des agents et sécurisations du projet One Connexion

## 🧭 Objectif
Ce projet est conçu pour être **auto-protégé** et **auto-documenté**.  
Chaque processus automatisé (lint, build, typage, test, hook Git, CI) est piloté par des **agents** documentés ici.  
Ce manuel définit les règles de comportement du projet pour éviter les régressions et les bugs cachés.

---

## 🧩 Agent 1 : Husky
**Rôle :** Gardien des commits Git  
**Fichier :** `.husky/pre-commit`

### Fonctionnement
- S’exécute avant chaque `git commit`.  
- Lance `npx lint-staged` pour vérifier uniquement les fichiers modifiés.  
- Bloque le commit si le lint échoue.  
- Corrige automatiquement les erreurs mineures (`eslint --fix`).

### Commandes
```bash
npx husky install
chmod +x .husky/pre-commit
```

### Si le hook ne se déclenche pas
```bash
npx husky install
git config core.hooksPath .husky
```

---

## ⚙️ Agent 2 : lint-staged
**Rôle :** Lint ciblé sur les fichiers modifiés  
**Défini dans :** `package.json`

### Configuration recommandée
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "eslint --max-warnings=0",
    "git add"
  ]
}
```

---

## 🧠 Agent 3 : ESLint
**Rôle :** Vérification globale du code  
**Commande :** `npm run lint:safe`

### Description
- Corrige automatiquement les erreurs simples.  
- Masque les avertissements non bloquants.  
- Sert de test global avant build ou merge.

### En cas d’erreur « @eslint/js introuvable »
Installe le module manquant :
```bash
npm install --save-dev @eslint/js
```

---

## 🧩 Agent 4 : Dashboard Client
**Rôle :** Composant principal du tableau de bord client
**Fichier :** `src/components/dashboard-client/DashboardClient.tsx`

### Description
- Layout à trois colonnes : sidebar, contenu principal, panneau latéral.  
- Squelette visuel complet, sans données réelles (placeholder uniquement).  
- Props dynamiques : `userName`, `userEmail`, `avatarUrl`.  
- Compatible Tailwind, lucide-react, shadcn/ui.  
- Prêt à être connecté à Supabase.

---

## 🚀 Agent 5 : Build et environnement
**Commandes principales :**
```bash
npm run lint:safe
npm run build
npm run dev
```

💡 Si ces trois commandes passent sans erreur, l’environnement est **propre et stable**.

---

## 🧩 Agent 6 : Codex Pro
**Rôle :** Superviseur IA et auditeur technique local.

### Capacités
- Analyse la cohérence du code et les dépendances.  
- Vérifie la logique des fichiers et des hooks.  
- Suit les consignes de ce manuel avant toute action automatique.  
- Ne modifie rien sans validation humaine.

---

## 🧱 Agent 7 : Résolution des erreurs courantes

| Problème | Cause probable | Solution |
|-----------|----------------|-----------|
| Husky ne se déclenche pas | Hook inactif | `chmod +x .husky/pre-commit` |
| Lint échoue sans raison | Cache npm corrompu | `rm -rf node_modules && npm install` |
| Erreur 403 npm | Mauvais registre | `npm config set registry https://registry.npmjs.org/` |
| Typage cassé | Types Supabase modifiés | `npm run build` |

---

## ✅ Vérification avant merge
Avant de fusionner une branche :
```bash
npm run lint:safe
npm run build
npm run dev
```
Si tout passe :
```bash
git add .
git commit -m "release stable"
git push
git tag -a v1.0.0-stable -m "Version stable sans erreur"
git push origin v1.0.0-stable
```

---

## 💡 Notes finales
- Ce fichier est **le cœur du projet**.  
- Tous les agents (humains et IA) s’y réfèrent.  
- Ne le supprime jamais, et mets-le à jour si tu modifies la structure.

📘 **AGENTS.md** = zéro bug, zéro commit cassé, zéro build bloqué.

🔚 **Fin du fichier AGENTS.md** 🔚
━━━━━━━━━━━━━━━━━━
