package service

import (
	"errors"
	"strings"

	"api-golang/search/model"
)

type SearchService interface {
	Search(query string, types []string, limit int) (model.SearchResponse, error)
}

type searchService struct{}

func NewSearchService() SearchService {
	return &searchService{}
}

func (s *searchService) Search(query string, types []string, limit int) (model.SearchResponse, error) {
	q := strings.TrimSpace(query)
	if q == "" {
		return model.SearchResponse{}, errors.New("missing query parameter: q")
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 50 {
		limit = 50
	}

	// ✅ MOCK RESULTS (à remplacer quand Merieme donne schéma DB)
	results := []model.SearchResult{
		{Type: "task", ID: 1, Label: "Demo task result", Snippet: "This is a mock search result."},
		{Type: "user", ID: 2, Label: "Demo user result", Snippet: "Mock user snippet."},
	}

	// Appliquer limit
	if len(results) > limit {
		results = results[:limit]
	}

	return model.SearchResponse{
		Query:   q,
		Results: results,
	}, nil
}
