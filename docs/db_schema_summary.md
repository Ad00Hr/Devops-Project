# DB Schema Summary – Team 4 (Global Search)

## Base de données
- Type: SQLite
- Fichier: dev.db (racine du projet)
- Connexion: api-golang/database/db.go
- Remarque: db.go gère la connexion uniquement (pas de CREATE TABLE)

## Table: users (Team 1 – Auth)
Source:
- Branche: origin/feature/auth
- Migration DB côté Node + SQL validé
- DB: SQLite

Champs:
- id (PK)
- username (unique, not null)
- email (unique, not null)
- password (not null)
- created_at (default current_timestamp)

Champs recherchables:
- username
- email

## Table: tasks (Team 2)
Source:
- Script SQL validé (Team 2)

Champs:
- id (PK)
- title (not null)
- description
- status (TODO / IN_PROGRESS / DONE)
- priority (LOW / MEDIUM / HIGH)
- due_date
- assigned_to (FK -> users.id)
- created_at (default current_timestamp)

Champs recherchables:
- title
- description

Relations:
- tasks.assigned_to → users.id

## Tables encore à confirmer
- events (Team 7)
- polls (Team 3)
