# Formulaire d'inscription entreprise

## Champs et règles de validation

| Champ | Obligatoire | Règles principales | Message d'erreur |
| ----- | ----------- | ------------------ | ---------------- |
| Nom de la société | Oui | Trim, 2 à 120 caractères | « Indiquez un nom de société (2 caractères min.). » |
| E-mail professionnel | Oui | Trim + minuscule, format e-mail RFC | « Adresse e-mail invalide. » (si vide : « L'adresse e-mail est requise. ») |
| Téléphone | Oui | Nettoyage des espaces/points, accepte `0XXXXXXXXX` (10 chiffres) ou `+XXXXXXXX` (8–15 chiffres) | « Saisissez un numéro de téléphone valide. » |
| Numéro de SIRET | Oui | 14 chiffres, contrôle Luhn, nettoyage des caractères non numériques | « Le SIRET doit contenir 14 chiffres. » ou « Le SIRET est invalide. » |
| Secteur d'activité | Oui | Valeur issue de la configuration (`src/config/secteurs.ts`) | « Sélectionnez un secteur. » |
| Adresse — ligne 1 | Oui | Trim, ≥5 caractères, ≤120 | « Adresse (ligne 1) requise. » |
| Adresse — ligne 2 | Non | Trim, ≤120, renvoyée comme `undefined` si vide | — |
| Code postal | Oui | Trim, 5 chiffres | « Le code postal est requis. » ou « Code postal invalide (5 chiffres). » |
| Ville | Oui | Trim, ≥2 caractères, ≤80 | « La ville est requise. » |
| Pays | Oui | Trim, ≥2 caractères, ≤56 (valeur par défaut : « France ») | « Le pays est requis. » |

Les numéros de téléphone nationaux sont convertis en format E.164 (`+33` + numéro sans le zéro initial) lors de la soumission. Les adresses sont normalisées (`line2` supprimée si vide).

## Liste configurable des secteurs

Les options disponibles et leurs libellés sont définis dans [`src/config/secteurs.ts`](src/config/secteurs.ts). Chaque entrée expose :

```ts
export interface SectorOption {
  value: SectorValue; // clé interne (MEDICAL, OPTIQUE, ...)
  label: string;      // libellé i18n affiché
}
```

Ce fichier dérive directement des constantes de `src/lib/packageTaxonomy.ts` afin d'assurer la cohérence client / serveur.

## Gestion des erreurs et accessibilité

- Les labels (`<FormLabel>`) sont liés aux champs via `htmlFor/id` générés par `FormControl`.
- Les messages d'erreur (`<FormMessage>`) sont annoncés avec `aria-live="polite"` et reliés via `aria-describedby`.
- Les champs requis portent un astérisque visuel et l'attribut `required`.
- La soumission affiche un message global (`toast.success`) uniquement lorsque toutes les validations passent.

## Tests

- Tests unitaires (`vitest`) couvrant :
  - le schéma Zod (`registrationSchema`) — e-mails, téléphones et SIRET invalides/valides,
  - la présence des champs, la remontée des erreurs et la normalisation des données lors d'une soumission réussie.
- Tests E2E (`playwright`) vérifiant :
  - le blocage de la soumission tant que des champs obligatoires sont invalides,
  - la navigation clavier (parcours desktop) et la sélection d'un secteur issu de la configuration,
  - le parcours mobile avec message de succès après saisie complète.

> ℹ️ Pour exécuter les E2E, installez Playwright dans votre environnement :
>
> ```bash
> npm install --save-dev @playwright/test
> npx playwright install
> npm run test:e2e
> ```
