// api-gateway/main.go
package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func newProxy(target string, stripPrefix string) http.Handler {
	u, err := url.Parse(target)
	if err != nil {
		log.Fatalf("invalid proxy target %s: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(u)
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		// rewrite path: /api/go/polls -> /api/polls (strip /api/go, add back /api)
		path := strings.TrimPrefix(r.URL.Path, stripPrefix)
		r.URL.Path = "/api" + path
		if r.URL.Path == "/api" || r.URL.Path == "/api/" {
			r.URL.Path = "/"
		}
		originalDirector(r)
	}
	return proxy
}

func main() {
	// proxy /api/go/* -> http://api-golang:8080/* (strip /api/go)
	goProxy := newProxy("http://api-golang:8080", "/api/go")
	nodeProxy := newProxy("http://api-node:3000", "/api/node")

	mux := http.NewServeMux()
	mux.Handle("/api/go/", goProxy)
	mux.Handle("/api/go", goProxy)
	mux.Handle("/api/node/", nodeProxy)
	mux.Handle("/api/node", nodeProxy)

	handler := cors(mux)

	fmt.Println("API Gateway (reverse-proxy) running on port 8081")
	if err := http.ListenAndServe(":8081", handler); err != nil {
		log.Fatalf("gateway failed: %v", err)
	}
}
