---
trigger: always_on
---

# RULE : QUALITÉ DU CODE TYPESCRIPT

1. **Zéro `any` :** L'utilisation du type `any` est formellement interdite. 
2. **Typage exhaustif :** Tous les DTOs (Data Transfer Objects), les requêtes, les réponses API et les props React doivent être strictement typés avec des Interfaces ou des Types.
3. **Validation :** Les données entrantes sur l'API doivent systématiquement être validées via `class-validator` et `class-transformer` dans NestJS.