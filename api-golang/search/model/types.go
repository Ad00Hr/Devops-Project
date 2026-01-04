package model

type SearchResult struct {
	Type    string `json:"type"`
	ID      int64  `json:"id"`
	Label   string `json:"label"`
	Snippet string `json:"snippet"`
}

type SearchResponse struct {
	Query   string         `json:"query"`
	Results []SearchResult `json:"results"`
}
