// api-golang/database/db.go
package database

import (
	"database/sql"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

// DB est déclaré en MAJUSCULE pour être accessible partout (Global)
var DB *sql.DB

// InitDB initializes the shared SQLite database
func InitDB() error {
	// --- CORRECTION CHEMIN ---
	// On récupère le chemin depuis docker-compose (DB_PATH=/app/dev.db)
	// Si la variable est vide, on utilise "./dev.db" par défaut
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./dev.db"
	}

	var err error
	
	// --- CORRECTION VARIABLE ---
	// Utilisation de "DB" (Majuscule) au lieu de "db"
	DB, err = sql.Open("sqlite3", dbPath+"?cache=shared&mode=rwc&_fk=1")
	if err != nil {
		return err
	}

	// Test the connection
	return DB.Ping()
}

// GetTime returns the current time from SQLite
func GetTime(ctx *gin.Context) string {
	var now string

	// --- CORRECTION VARIABLE ---
	// Utilisation de "DB" (Majuscule)
	row := DB.QueryRow("SELECT datetime('now', 'localtime')")
	
	err := row.Scan(&now)
	if err != nil {
		os.Stderr.WriteString("SQLite query failed: " + err.Error() + "\n")
		// On évite le os.Exit(1) ici pour ne pas crasher tout le serveur si la DB a un hoquet,
		// mais on renvoie une erreur vide ou on log.
		return "Error fetching time"
	}
	return now
}