import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:3000/api/chat/messages";

export default function TeamChat() {
  const [username, setUsername] = useState(
    localStorage.getItem("chat_user") || ""
  );
  const [draftUser, setDraftUser] = useState(username);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const boxRef = useRef(null);

  /* ======================
     Charger messages
  ====================== */
  const loadMessages = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setMessages(data);
  };

  /* ======================
     Auto-refresh
  ====================== */
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ======================
     Scroll auto
  ====================== */
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  /* ======================
     Sauver utilisateur
  ====================== */
  const saveUser = () => {
    if (!draftUser.trim()) return;
    setUsername(draftUser);
    localStorage.setItem("chat_user", draftUser);
  };

  /* ======================
     Déconnexion
  ====================== */
  const logout = () => {
    localStorage.removeItem("chat_user");
    setUsername("");
    setDraftUser("");
  };

  /* ======================
     Envoyer message
  ====================== */
  const sendMessage = async () => {
    if (!text.trim() || !username) return;

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        content: text,
      }),
    });

    setText("");
    loadMessages();
  };

  /* ======================
     Supprimer message
  ====================== */
  const deleteMessage = async (id) => {
    if (!window.confirm("Supprimer ce message ?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadMessages();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3 style={styles.title}>💬 Chat Collaboratif</h3>

        {/* USER */}
        {!username ? (
          <div style={styles.userRow}>
            <input
              value={draftUser}
              onChange={(e) => setDraftUser(e.target.value)}
              placeholder="Ton nom"
              style={styles.input}
            />
            <button onClick={saveUser} style={styles.button}>
              OK
            </button>
          </div>
        ) : (
          <div style={styles.userInfo}>
            <span>Connecté : <b>{username}</b></span>
            <button onClick={logout} style={styles.logout}>
              Changer
            </button>
          </div>
        )}

        {/* ACTIONS */}
        <button onClick={loadMessages} style={styles.refresh}>
          🔄 Actualiser
        </button>

        {/* MESSAGES */}
        <div ref={boxRef} style={styles.messages}>
          {messages.map((m) => (
            <div key={m.id} style={styles.message}>
              <div style={styles.meta}>
                <b>{m.username}</b> •{" "}
                {new Date(m.created_at).toLocaleString()}
              </div>

              <div>{m.content}</div>

              {m.username === username && (
                <button
                  onClick={() => deleteMessage(m.id)}
                  style={styles.delete}
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={styles.inputRow}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écris un message..."
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{
              ...styles.button,
              opacity: text.trim() ? 1 : 0.5,
            }}
            disabled={!text.trim()}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================
   STYLES
====================== */
const styles = {
  page: {
  minHeight: "100vh",
  background: "#1e1e1e",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",   // ✅ IMPORTANT
},
  card: {
  width: 360,
  background: "#111",
  borderRadius: 16,
  padding: 16,
  color: "#fff",
  boxShadow: "0 0 30px rgba(0,0,0,0.7)",
  margin: "0 auto",        // ✅ CENTRAGE FORCÉ
},

  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  userRow: { display: "flex", gap: 8, marginBottom: 10 },
  userInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    fontSize: 13,
  },
  logout: {
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
  },
  refresh: {
    width: "100%",
    marginBottom: 8,
    background: "#2a2a2a",
    border: "none",
    color: "#ccc",
    padding: 6,
    borderRadius: 8,
    cursor: "pointer",
  },
  inputRow: { display: "flex", gap: 8 },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: "none",
    background: "#2a2a2a",
    color: "#fff",
  },
  button: {
    background: "#6c63ff",
    border: "none",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },
  messages: {
    height: 320,
    overflowY: "auto",
    background: "#0c0c0c",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  message: {
    background: "#1e1e1e",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  meta: { fontSize: 12, opacity: 0.7 },
  delete: {
    marginTop: 6,
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    fontSize: 12,
  },
};
