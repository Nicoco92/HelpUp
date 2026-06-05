---
trigger: always_on
---

# RULE : SÉCURITÉ ABSOLUE

1. **Authentification :** Implémentation obligatoire de JWT (ou Supabase/Clerk). Les mots de passe doivent être hachés (Bcrypt/Argon2).
2. **Paiements :** Les transactions doivent être validées **uniquement** via les Webhooks sécurisés de Stripe côté serveur. Aucune validation de paiement ne doit se faire sur le Frontend.
3. **Protection des routes :** Toutes les routes API sensibles doivent être protégées par des Guards NestJS et vérifier les permissions de l'utilisateur.