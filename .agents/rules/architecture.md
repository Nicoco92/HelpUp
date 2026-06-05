---
trigger: always_on
---

# RULE : ARCHITECTURE & ROLES

1. **Clean Architecture :** Le code backend NestJS doit séparer strictement les Controllers (HTTP), les Services (Logique métier) et les Repositories (Data).
2. **RBAC (Role-Based Access Control) :** La base de données doit gérer des rôles stricts : `CLIENT`, `PROVIDER`, `PREMIUM_PROVIDER` et `ADMIN`.
3. **Gestion des erreurs :** Utiliser des Exception Filters sur le Backend. Le Frontend mobile doit posséder des Error Boundaries pour ne jamais crasher de manière inattendue.