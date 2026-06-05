---
trigger: always_on
---

# RULE : FEATURES, WORKFLOW & TRUST

1. **State Machine (Cycle de vie des entités) :**
   - Le cycle de vie d'une `Mission` doit être strictement contrôlé. Une mission ne peut pas passer de `PUBLIÉE` à `TERMINÉE` sans passer par `ASSIGNÉE` et `EN_COURS`.
   - Utilise des Enums stricts en TypeScript et dans la base de données pour gérer ces statuts.

2. **Messagerie & Temps Réel :**
   - Le polling HTTP est interdit pour le chat in-app. Utilise exclusivement des WebSockets (Socket.io ou GraphQL Subscriptions) pour la messagerie entre utilisateurs.
   - Les messages doivent être stockés en base de données pour garder un historique en cas de litige.

3. **Trust & Safety (Modération) :**
   - Les données sensibles des utilisateurs (comme les justificatifs d'identité) ne doivent être accessibles que par les rôles `ADMIN`.
   - Les URL d'images (S3) stockées en base de données doivent idéalement être signées (Signed URLs) avec une durée d'expiration pour protéger la vie privée des utilisateurs.

4. **Logique Métier du Paiement Mixte :**
   - Si la mission est réglée via l'application : Stripe gère le paiement total et le split (Prestataire + Commission).
   - Si la mission est réglée "sur place" (cash) : Le backend doit quand même sécuriser la commission de la plateforme (10-15%) via une empreinte bancaire du client avant de valider la mise en relation.

5. **Optimisation des requêtes PostGIS :**
   - Lors de la recherche des prestataires pour une mission, la requête SQL doit utiliser les index géographiques (`GIST`) pour ne pas surcharger le serveur si la base de données grandit.
