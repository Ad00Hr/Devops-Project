import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CurrentTime from "./CurrentTime";
import AuthApp from "./AuthApp";
import './App.css';

const queryClient = new QueryClient();

export default function App() {
  const [showAuth, setShowAuth] = useState(false); // pour afficher AuthApp

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App" style={{ padding: 20 }}>
        <h1>Hey Team! 👋</h1>

        {!showAuth && (
          <>
            {/* Bouton bien visible */}
            <div style={{ margin: "20px 0" }}>
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none"
                }}
                onClick={() => setShowAuth(true)}
              >
                Accéder à l'authentification
              </button>
            </div>

            {/* Affichage de tes APIs seulement si pas sur Auth */}
            <CurrentTime api="/api/golang/" />
            <CurrentTime api="/api/node/" />
          </>
        )}

        {/* Affiche AuthApp uniquement si l'utilisateur clique sur le bouton */}
        {showAuth && (
          <>
            <button
              style={{ marginBottom: 20 }}
              onClick={() => setShowAuth(false)}
            >
              ← Retour
            </button>
            <AuthApp />
          </>
        )}

        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}
