import { useState } from "react";
import AuthApp from "./AuthApp";
import TeamChat from "./TeamChat";
import UserProfile from "./UserProfile"; // Assurez-vous que le fichier UserProfile.jsx existe
import "./App.css";

export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("chat"); // État pour basculer

  const token = localStorage.getItem("token");

  if (!logged) {
    return <AuthApp onLoginSuccess={() => setLogged(true)} />;
  }

  return (
    <div className="App">
      {/* Barre de navigation pour basculer */}
      <nav style={{ padding: "10px", background: "#111", display: "flex", justifyContent: "center", gap: "10px" }}>
        <button 
          onClick={() => setActiveTab("chat")}
          style={{ background: activeTab === "chat" ? "#6c63ff" : "#222", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
        >
          💬 Chat
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          style={{ background: activeTab === "profile" ? "#6c63ff" : "#222", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}
        >
          👤 Mon Profil
        </button>
      </nav>

      {/* Contenu dynamique */}
      <main style={{ marginTop: "20px" }}>
        {activeTab === "chat" ? (
          <TeamChat />
        ) : (
          <UserProfile userToken={token} />
        )}
      </main>
    </div>
  );
}