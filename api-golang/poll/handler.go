package poll

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service *Service
}

// ✅ Constructor
func NewHandler(service *Service) *Handler {
	return &Handler{Service: service}
}
func (h *Handler) GetPolls(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Poll API is working",
		"status": "OK",
	})
}


func (h *Handler) CreatePoll(c *gin.Context) {
	var req CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// user mocké
	pollID, err := h.Service.CreatePoll(req, 1)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"poll_id": pollID})
}

func (h *Handler) Vote(c *gin.Context) {
	pollID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Poll ( dependency)
	poll := Poll{
		ID:       pollID,
		Type:     "single",
		IsClosed: false,
	}

	err := h.Service.Vote(poll, req, 1)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote enregistré"})

}
	func (h *Handler) GetResults(c *gin.Context) {
    // Code temporaire pour que ça compile
    c.JSON(200, gin.H{"message": "Resultats (TODO)"})
}

func (h *Handler) ClosePoll(c *gin.Context) {
    // Code temporaire pour que ça compile
    c.JSON(200, gin.H{"message": "Fermer poll (TODO)"})
}
