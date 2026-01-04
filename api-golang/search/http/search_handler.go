package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"api-golang/search/service"
)

type SearchHandler struct {
	Svc service.SearchService
}

func NewSearchHandler(svc service.SearchService) *SearchHandler {
	return &SearchHandler{Svc: svc}
}

// GET /api/search?q=...&types=task,user&limit=20
func (h *SearchHandler) HandleSearch(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	typesParam := r.URL.Query().Get("types")
	limitParam := r.URL.Query().Get("limit")

	var types []string
	if strings.TrimSpace(typesParam) != "" {
		for _, t := range strings.Split(typesParam, ",") {
			tt := strings.TrimSpace(t)
			if tt != "" {
				types = append(types, tt)
			}
		}
	}

	limit := 20
	if strings.TrimSpace(limitParam) != "" {
		if v, err := strconv.Atoi(limitParam); err == nil {
			limit = v
		}
	}

	resp, err := h.Svc.Search(q, types, limit)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
