package database

import (
	"database/sql"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

// InitDB initializes the shared SQLite database
func InitDB() error {
	// go up to project root
	_, currentFile, _, _ := runtime.Caller(0)
	rootDir := filepath.Dir(filepath.Dir(filepath.Dir(currentFile)))
	dbPath := filepath.Join(rootDir, "dev.db")

	var err error
	db, err = sql.Open("sqlite3", dbPath+"?cache=shared&mode=rwc&_fk=1")
	if err != nil {
		return err
	}

	// test connection
	if err := db.Ping(); err != nil {
		return err
	}

	// run migrations
	return Migrate()
}

func GetTime(ctx *gin.Context) time.Time {
	var s string

	err := db.QueryRow("SELECT datetime('now')").Scan(&s)
	if err != nil {
		os.Stderr.WriteString("SQLite query failed: " + err.Error() + "\n")
		os.Exit(1)
	}

	t, _ := time.Parse("2006-01-02 15:04:05", s)
	return t
}

// Migrate executes all SQL files in api-golang/migrations
func Migrate() error {
	_, currentFile, _, _ := runtime.Caller(0)
	rootDir := filepath.Dir(filepath.Dir(filepath.Dir(currentFile)))
	migrationsDir := filepath.Join(rootDir, "api-golang", "migrations")

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		// Si le dossier n'existe pas encore, tu peux retourner nil ou err.
        // Ici on retourne err pour obliger la présence des migrations.
		return err
	}

	var files []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasSuffix(entry.Name(), ".sql") {
			files = append(files, filepath.Join(migrationsDir, entry.Name()))
		}
	}

	// Ensure migrations run in order: 001_, 002_, etc.
	sort.Strings(files)

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		if _, err := db.Exec(string(content)); err != nil {
			return err
		}
	}

	return nil
}

func DB() *sql.DB {
	return db
}
