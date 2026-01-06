package test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"api-golang/database"
	"api-golang/routes"
	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	// INITIALISATION DB (OBLIGATOIRE POUR LES TESTS)
	if err := database.InitDB(); err != nil {
		panic(err)
	}

	r := gin.Default()
	r.GET("/calendar", routes.GetCalendar)
	r.POST("/calendar", routes.CreateCalendar)
	r.PUT("/calendar/:id", routes.UpdateCalendar)
	r.DELETE("/calendar/:id", routes.DeleteCalendar)
	r.GET("/calendar/:id", routes.GetCalendarByID)
	return r
}

func TestGetCalendarReturns200(t *testing.T) {
	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/calendar", nil)
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

func TestCreateCalendarBadRequest(t *testing.T) {
	r := setupRouter()
	w := httptest.NewRecorder()

	// title trop court + champs manquants => 400
	body := []byte(`{"title":"aa"}`)
	req, _ := http.NewRequest("POST", "/calendar", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != 400 {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}
