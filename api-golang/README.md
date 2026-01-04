
# Calendar API - Go + Gin + SQLite

Cette API REST permet de gérer un calendrier d'événements. Elle est développée en Go avec le framework Gin et utilise SQLite pour le stockage des données.

## Fonctionnalités

L'API permet d'effectuer les opérations CRUD complètes sur les événements :
- Création d'événements
- Lecture (liste complète ou par identifiant unique)
- Modification d'événements existants
- Suppression d'événements

## Installation et Lancement

### Prérequis
- Go (version 1.18 ou supérieure)

### 1. Installer les dépendances
```bash
go mod download
```

### 2. Démarrer l'API
```bash
go run main.go
```
Par défaut, l'API est accessible à l'adresse suivante : `http://localhost:8080`

---

## Documentation des Endpoints

### Santé de l'API
Vérifier que le service est opérationnel.

**GET /**

Exemple de réponse :
```json
{
  "api": "golang",
  "now": "2026-01-04T10:30:00Z"
}
```

### Gestion du Calendrier

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| GET | /calendar | Récupérer tous les événements |
| GET | /calendar/:id | Récupérer un événement par son ID |
| POST | /calendar | Créer un nouvel événement |
| PUT | /calendar/:id | Modifier un événement existant |
| DELETE | /calendar/:id | Supprimer un événement |

---

## Détails des Requêtes

### Créer un événement
**POST /calendar**

En-têtes : `Content-Type: application/json`

Corps de la requête :
```json
{
  "title": "Cours DevOps",
  "description": "Chapitre Docker",
  "start_date": "2026-01-10",
  "end_date": "2026-01-11",
  "user_id": 1
}
```

### Modifier un événement
**PUT /calendar/:id**

Corps de la requête :
```json
{
  "title": "Cours modifié",
  "description": "Mise à jour du contenu",
  "start_date": "2026-01-10",
  "end_date": "2026-01-11",
  "user_id": 1
}
```

---

## Validation et Gestion des Erreurs

L'API applique les règles de validation suivantes :

- **title** : Obligatoire (minimum 3 caractères).
- **start_date** : Obligatoire.
- **end_date** : Obligatoire.
- **user_id** : Obligatoire.
- **Logique** : La date de début (`start_date`) doit être chronologiquement antérieure à la date de fin (`end_date`).

En cas de non-respect de ces règles, l'API retourne un code d'erreur avec le format suivant :
```json
{
  "error": "invalid fields",
  "details": "..."
}
```

---

## Base de données

L'API utilise SQLite. Le fichier de base de données est généré automatiquement lors du premier lancement.

- **Fichier** : `dev.db`
- **Table** : `calendar`