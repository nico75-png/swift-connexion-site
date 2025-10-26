# 🤖 AGENTS.md — Manuel des agents et sécurisations du projet Swift Connexion

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
**Rôle :** Lint ciblé sur les fichiers en staging  
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

### Objectif
Seuls les fichiers modifiés sont vérifiés ; le lint global n’est plus bloquant pour les fichiers anciens.

---

## 🧠 Agent 3 : ESLint
**Rôle :** Vérification globale du code source  
**Commande :** `npm run lint:safe`

### Description
- `--fix` corrige automatiquement les erreurs simples.  
- `--quiet` masque les avertissements non bloquants.  
- Sert de test global avant build ou merge.

### En cas d’erreur « @eslint/js introuvable »
Installe le module manquant :
```bash
npm install --save-dev @eslint/js
```

---

## 🧩 Agent 4 : Dashboard Client
**Rôle :** Composant principal d’interface utilisateur  
**Fichier :** `src/components/dashboard-client/DashboardClient.tsx`

### Description
- Layout à trois colonnes (sidebar / espace principal / panneau latéral droit).  
- Squelette visuel réactif, sans données réelles pour le moment.  
- Props dynamiques : `userName`, `userEmail`, `avatarUrl`.  
- Prêt à être relié à Supabase ou autre backend.  
- Compatible avec shadcn/ui, lucide-react et Tailwind.

### Rappel
Ce dashboard est **structurellement complet** mais **non connecté** à Supabase.  
Il sert d’ossature pour construire les futures fonctionnalités.

---

## 🚀 Agent 5 : Build et environnement
**Rôle :** Vérification complète du projet avant exécution ou déploiement.

### Commandes
```bash
npm run lint:safe
npm run build
npm run dev
```

💡 Si ces trois commandes passent sans erreur, ton environnement est garanti **stable et déployable**.

---

## 🧩 Agent 6 : Codex Pro
**Rôle :** Superviseur IA local et auditeur technique.

### Capacités
- Analyse le code, détecte les erreurs structurelles.  
- Vérifie la cohérence du typage et des dépendances.  
- Suit ce manuel pour ajuster automatiquement les workflows (Husky, ESLint, Supabase…).  
- Ne modifie jamais directement le code sans validation humaine.

💬 Quand Codex Pro affiche « Je dois trouver le fichier AGENTS.md »,  
cela signifie qu’il recherche ce manuel pour charger les règles du projet.

---

## 🧱 Agent 7 : Résolution des erreurs courantes

| Problème | Cause probable | Solution |
|-----------|----------------|-----------|
| Husky ne se déclenche pas | Hook inactif | `chmod +x .husky/pre-commit` |
| Lint échoue sans raison | Cache npm corrompu | `rm -rf node_modules && npm install` |
| Erreur `403` npm | Mauvais registre | `npm config set registry https://registry.npmjs.org/` |
| Typage cassé | Types Supabase modifiés | `npm run build` |

---

## ✅ Vérification avant merge ou déploiement

Avant tout merge, exécute :
```bash
npm run lint:safe
npm run build
npm run dev
```

Si tout est vert :
```bash
git add .
git commit -m "release stable"
git push
git tag -a v1.0.0-stable -m "Version stable sans erreur"
git push origin v1.0.0-stable
```

---

## 💡 Notes finales
- Ce fichier est **le cœur documentaire** de ton projet.  
- Tous les agents (humains ou IA) s’y réfèrent avant d’agir.  
- Ne le supprime jamais et garde-le à jour si tu ajoutes une intégration.

📘 **AGENTS.md** = zéro bug, zéro commit cassé, zéro build bloqué.
