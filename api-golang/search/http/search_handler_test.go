package http

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"api-golang/search/model"
)

// MOCK DU SERVICE
type mockSearchService struct{}

func (m *mockSearchService) Search(query string, types []string, limit int) (model.SearchResponse, error) {
	if query == "" {
		return model.SearchResponse{}, errMissingQuery()
	}

	return model.SearchResponse{
		Query: query,
		Results: []model.SearchResult{
			{
				Type:    "mock",
				ID:      1,
				Label:   "Test",
				Snippet: "Mock result",
			},
		},
	}, nil
}

func errMissingQuery() error {
	return &mockError{"missing query parameter: q"}
}

type mockError struct {
	msg string
}

func (e *mockError) Error() string {
	return e.msg
}

func TestHandleSearch_OK(t *testing.T) {
	svc := &mockSearchService{}
	handler := NewSearchHandler(svc)

	req := httptest.NewRequest("GET", "/api/search?q=test", nil)
	rec := httptest.NewRecorder()

	handler.HandleSearch(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	if !strings.Contains(rec.Body.String(), `"query":"test"`) {
		t.Errorf("response body does not contain query")
	}
}

func TestHandleSearch_MissingQuery(t *testing.T) {
	svc := &mockSearchService{}
	handler := NewSearchHandler(svc)

	req := httptest.NewRequest("GET", "/api/search", nil)
	rec := httptest.NewRecorder()

	handler.HandleSearch(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}
