package poll

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{Service: service}
}

// 1. GetPolls: Khassha tjib data men DB
func (h *Handler) GetPolls(c *gin.Context) {
	// Appel l service (khass tkon sawbtiha f service.go)
	polls, err := h.Service.GetAllPolls()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Impossible de récupérer les polls"})
		return
	}
	c.JSON(http.StatusOK, polls)
}

// 2. GetPollById: Zid hadi, daroriya bach l-frontend y-afficher les options
func (h *Handler) GetPoll(c *gin.Context) {
	pollID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID invalide"})
		return
	}

	poll, err := h.Service.GetPoll(pollID) // Khass tkon f Service
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll introuvable"})
		return
	}

	c.JSON(http.StatusOK, poll)
}

func (h *Handler) CreatePoll(c *gin.Context) {
	var req CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	pollID, err := h.Service.CreatePoll(req, 1) // UserID mocké à 1
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"poll_id": pollID})
}

// 3. Vote: Hna fin kayn l-fix lmohim
func (h *Handler) Vote(c *gin.Context) {
	// Fix: Vérifier l'erreur de conversion
	pollID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID invalide"})
		return
	}

	var req VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ ÉTAPE CRUCIALE : Jeb l-poll men DB bach t3rf Type o wash msdoud
	// Khassk tkon zti GetPoll f Service dyalk
	poll, err := h.Service.GetPoll(pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ce poll n'existe pas"})
		return
	}

	// Get userID from header or query param, default to random
	userID := int64(1)
	if uid := c.GetHeader("X-User-ID"); uid != "" {
		if parsed, err := strconv.ParseInt(uid, 10, 64); err == nil {
			userID = parsed
		}
	}
	if uid := c.Query("user_id"); uid != "" {
		if parsed, err := strconv.ParseInt(uid, 10, 64); err == nil {
			userID = parsed
		}
	}

	// Daba 3ad sift l-poll l-ha9i9i l Service
	err = h.Service.Vote(*poll, req, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vote enregistré avec succès"})
}

// Dans internal/poll/handler.go

func (h *Handler) GetResults(c *gin.Context) {
	pollID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID invalide"})
		return
	}

	// Get poll details
	poll, err := h.Service.GetPoll(pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll introuvable"})
		return
	}

	// Get vote counts per option from database
	results := make(map[int64]int64)
	for _, opt := range poll.Options {
		count, _ := h.Service.Repo.GetVoteCount(opt.ID)
		results[opt.ID] = count
	}

	c.JSON(http.StatusOK, gin.H{
		"poll_id":  poll.ID,
		"question": poll.Question,
		"type":     poll.Type,
		"options":  poll.Options,
		"results":  results,
	})
}

func (h *Handler) ClosePoll(c *gin.Context) {
	// Placeholder
	c.JSON(200, gin.H{"message": "ClosePoll function not implemented yet"})
}
