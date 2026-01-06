package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"api-golang/database"
	"api-golang/poll"
)

func init() {
	// Initialisation SQLite
	if err := database.InitDB(); err != nil {
		log.Fatalf("Unable to open SQLite database (dev.db): %v", err)
	}
	log.Println("SQLite database ready (dev.db)")
}

func main() {

	r := gin.Default()

	// =========================
	// BASIC ENDPOINTS (EXISTANTS)
	// =========================

	r.GET("/", func(c *gin.Context) {
		now := database.GetTime(c)
		c.JSON(200, gin.H{
			"api": "golang",
			"now": now,
		})
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, "pong wiwi")
	})

	// =========================
	// FEATURE 5 : POLL SYSTEM
	// =========================

	// Init repository / service / handler
	repo := poll.NewRepository(database.DB)
	service := poll.NewService(repo)
	handler := poll.NewHandler(service)

	api := r.Group("/api")
	{
		api.GET("/poll", handler.GetPolls)
		api.POST("/polls", handler.CreatePoll)
		api.POST("/polls/:id/vote", handler.Vote)
		api.GET("/polls/:id/results", handler.GetResults)
		api.PATCH("/polls/:id/close", handler.ClosePoll)
	}

	// =========================

	r.Run(":8080")
}
