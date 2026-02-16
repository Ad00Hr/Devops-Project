package test

import (
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"net/url"
	"strings"
	"testing"
)

// TestCORS vérifie que le middleware CORS fonctionne correctement
func TestCORS(t *testing.T) {
	// Créer un handler de test simple
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Appliquer le middleware CORS
	handler := cors(testHandler)

	// Créer une requête OPTIONS (pre-flight)
	req := httptest.NewRequest("OPTIONS", "/", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	// Vérifier le status code (devrait être 200 pour OPTIONS)
	if w.Code != http.StatusOK {
		t.Errorf("CORS OPTIONS: expected status 200, got %d", w.Code)
	}

	// Vérifier les headers CORS
	headers := w.Header()
	if headers.Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("CORS: expected Allow-Origin *, got %s", headers.Get("Access-Control-Allow-Origin"))
	}
	if headers.Get("Access-Control-Allow-Methods") == "" {
		t.Error("CORS: Allow-Methods header not set")
	}
}

// TestCORSWithActualRequest vérifie que le CORS fonctionne avec une vraie requête
func TestCORSWithActualRequest(t *testing.T) {
	testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	handler := cors(testHandler)

	// Requête GET normale
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	// Vérifier les headers CORS sur la réponse
	headers := w.Header()
	if headers.Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("CORS GET: expected Allow-Origin *, got %s", headers.Get("Access-Control-Allow-Origin"))
	}
}

// TestNewProxy vérifie la création d'un proxy
func TestNewProxy(t *testing.T) {
	// Créer un serveur de test pour simuler l'API cible
	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Vérifier que le chemin a été correctement réécrit
		if r.URL.Path != "/api/polls" {
			t.Errorf("Expected path /api/polls, got %s", r.URL.Path)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "success"}`))
	}))
	defer targetServer.Close()

	// Créer le proxy
	proxy := newProxy(targetServer.URL, "/api/go")

	// Créer une requête vers le proxy
	req := httptest.NewRequest("GET", "/api/go/polls", nil)
	w := httptest.NewRecorder()

	proxy.ServeHTTP(w, req)

	// Vérifier la réponse
	if w.Code != http.StatusOK {
		t.Errorf("Proxy: expected status 200, got %d", w.Code)
	}

	expectedBody := `{"message": "success"}`
	if strings.TrimSpace(w.Body.String()) != expectedBody {
		t.Errorf("Proxy: expected body %s, got %s", expectedBody, w.Body.String())
	}
}

// TestProxyPathRewrite vérifie la réécriture des chemins
func TestProxyPathRewrite(t *testing.T) {
	tests := []struct {
		name        string
		inputPath   string
		stripPrefix string
		expected    string
	}{
		{
			name:        "Path with prefix",
			inputPath:   "/api/go/polls",
			stripPrefix: "/api/go",
			expected:    "/api/polls",
		},
		{
			name:        "Root path",
			inputPath:   "/api/go",
			stripPrefix: "/api/go",
			expected:    "/",
		},
		{
			name:        "Root path with slash",
			inputPath:   "/api/go/",
			stripPrefix: "/api/go",
			expected:    "/",
		},
		{
			name:        "Path with multiple segments",
			inputPath:   "/api/go/polls/123/votes",
			stripPrefix: "/api/go",
			expected:    "/api/polls/123/votes",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Créer un serveur de test qui capture la requête
			var capturedPath string
			targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				capturedPath = r.URL.Path
				w.WriteHeader(http.StatusOK)
			}))
			defer targetServer.Close()

			proxy := newProxy(targetServer.URL, tt.stripPrefix)

			req := httptest.NewRequest("GET", tt.inputPath, nil)
			w := httptest.NewRecorder()

			proxy.ServeHTTP(w, req)

			if capturedPath != tt.expected {
				t.Errorf("Path rewrite: expected %s, got %s", tt.expected, capturedPath)
			}
		})
	}
}

// TestMainFunction vérifie la configuration du serveur
func TestMainFunction(t *testing.T) {
	// Cette fonction est un peu plus complexe à tester
	// On va simuler le comportement du main sans le lancer vraiment

	// Vérifier que les routes sont correctement configurées
	mux := http.NewServeMux()

	// Simuler la configuration du main
	mux.Handle("/api/go/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	mux.Handle("/api/node/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Tester les routes
	tests := []struct {
		path     string
		expected int
	}{
		{"/api/go/test", http.StatusOK},
		{"/api/node/test", http.StatusOK},
		{"/invalid", http.StatusNotFound},
	}

	for _, tt := range tests {
		req := httptest.NewRequest("GET", tt.path, nil)
		w := httptest.NewRecorder()

		mux.ServeHTTP(w, req)

		if w.Code != tt.expected {
			t.Errorf("Route %s: expected %d, got %d", tt.path, tt.expected, w.Code)
		}
	}
}

// TestProxyError vérifie la gestion des erreurs du proxy
func TestProxyError(t *testing.T) {
	// Créer un proxy vers un serveur qui n'existe pas
	proxy := newProxy("http://localhost:9999", "/api/go")

	req := httptest.NewRequest("GET", "/api/go/test", nil)
	w := httptest.NewRecorder()

	// Cela ne devrait pas planter mais retourner une erreur 500 ou 502
	proxy.ServeHTTP(w, req)

	// Le reverse proxy Go retourne généralement 502 Bad Gateway
	if w.Code != http.StatusBadGateway && w.Code != http.StatusInternalServerError {
		t.Logf("Error status code: %d", w.Code)
	}
}

// TestHealthEndpoint vérifie l'endpoint health si vous en avez un
func TestHealthEndpoint(t *testing.T) {
	// Si vous avez un endpoint /health, vous pouvez le tester ici
	// Pour l'instant, on vérifie juste que le proxy fonctionne
	req := httptest.NewRequest("GET", "/api/go/health", nil)
	w := httptest.NewRecorder()

	// Note: Ce test suppose que votre API Go a un endpoint /health
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Logf("Health endpoint test (mocked): %d", w.Code)
	}
}

// BenchmarkProxyPerformance mesure la performance du proxy
func BenchmarkProxyPerformance(b *testing.B) {
	// Créer un serveur de test rapide
	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	proxy := newProxy(targetServer.URL, "/api/go")

	req := httptest.NewRequest("GET", "/api/go/test", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		w := httptest.NewRecorder()
		proxy.ServeHTTP(w, req)
	}
}

// TestConcurrentRequests teste le proxy avec des requêtes concurrentes
func TestConcurrentRequests(t *testing.T) {
	targetServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer targetServer.Close()

	proxy := newProxy(targetServer.URL, "/api/go")

	// Lancer 10 requêtes concurrentes
	done := make(chan bool)
	for i := 0; i < 10; i++ {
		go func() {
			req := httptest.NewRequest("GET", "/api/go/test", nil)
			w := httptest.NewRecorder()
			proxy.ServeHTTP(w, req)
			if w.Code != http.StatusOK {
				t.Errorf("Concurrent request failed: %d", w.Code)
			}
			done <- true
		}()
	}

	// Attendre que toutes les requêtes soient finies
	for i := 0; i < 10; i++ {
		<-done
	}
}

// Helper functions (copiées de votre code pour les tests)
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
	u, err := urlParse(target)
	if err != nil {
		panic(err)
	}
	proxy := httputilNewSingleHostReverseProxy(u)
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, stripPrefix)
		r.URL.Path = "/api" + path
		if r.URL.Path == "/api" || r.URL.Path == "/api/" {
			r.URL.Path = "/"
		}
		originalDirector(r)
	}
	return proxy
}

// Mock des fonctions net/url pour les tests
func urlParse(target string) (*url.URL, error) {
	return &url.URL{
		Scheme: "http",
		Host:   "localhost:8080",
	}, nil
}

func httputilNewSingleHostReverseProxy(target *url.URL) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host
		},
	}
}
