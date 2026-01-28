package service

import "testing"

func TestSearch_WithValidQuery(t *testing.T) {
	svc := NewSearchService()

	resp, err := svc.Search("test", []string{}, 10)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if resp.Query != "test" {
		t.Errorf("expected query 'test', got '%s'", resp.Query)
	}

	if len(resp.Results) == 0 {
		t.Errorf("expected at least one result")
	}
}

func TestSearch_EmptyQuery(t *testing.T) {
	svc := NewSearchService()

	_, err := svc.Search("", []string{}, 10)

	if err == nil {
		t.Errorf("expected error for empty query, got nil")
	}
}
