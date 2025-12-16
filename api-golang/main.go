package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"api-golang/database"
)

func init() {
	// NEW: No arguments, no DATABASE_URL, no file reading
	if err := database.InitDB(); err != nil {
		log.Fatalf("Unable to open SQLite database (dev.db): %v", err)
	}
	log.Println("SQLite database ready (dev.db)")

}

func main() {

	r := gin.Default()
	var now string

	r.GET("/", func(c *gin.Context) {
		now = database.GetTime(c)
		c.JSON(200, gin.H{
			"api": "golang",
			"now": now,
		})
	})

	r.GET("/ping", func(c *gin.Context) {
		now = database.GetTime(c)
		c.JSON(200, "pong")
	})

	r.Run() // listen and serve on 0.0.0.0:8080 (or "PORT" env var)
}
