import { useEffect, useState } from "react";

const API = "http://localhost:3000/api/users";

export default function UserProfile({ userToken }) {
    const [profile, setProfile] = useState(null);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ display_name: "", bio: "", avatar_url: "" });

    const headers = { 
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json"
    };

    const loadData = async () => {
        try {
            const [pRes, aRes, sRes] = await Promise.all([
                fetch(`${API}/me/profile`, { headers }),
                fetch(`${API}/me/activity`, { headers }),
                fetch(`${API}/me/stats`, { headers })
            ]);

            if (pRes.ok) {
                const data = await pRes.json();
                setProfile(data);
                setForm({
                    display_name: data.display_name || "",
                    bio: data.bio || "",
                    avatar_url: data.avatar_url || ""
                });
            }
            if (aRes.ok) setActivities(await aRes.json());
            if (sRes.ok) setStats(await sRes.json());
        } catch (e) {
            console.error("Erreur de chargement", e);
        }
    };

    useEffect(() => {
        if (userToken) loadData();
    }, [userToken]);

    const handleSave = async () => {
        const res = await fetch(`${API}/me/profile`, {
            method: "PUT",
            headers,
            body: JSON.stringify(form)
        });
        if (res.ok) {
            setIsEditing(false);
            loadData();
        }
    };

    if (!profile) return <div style={{color: "white", textAlign: "center", padding: "50px"}}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}`} style={styles.avatar} alt="Avatar" />
                    <div style={{flex: 1}}>
                        <h2 style={styles.username}>{profile.display_name || profile.username}</h2>
                        <p style={styles.email}>{profile.email}</p>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} style={styles.btnSecondary}>
                        {isEditing ? "Annuler" : "Modifier"}
                    </button>
                </div>

                {isEditing ? (
                    <div style={styles.editSection}>
                        <input style={styles.input} value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} placeholder="Nom d'affichage" />
                        <textarea style={styles.input} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio" />
                        <button onClick={handleSave} style={styles.btnPrimary}>Enregistrer</button>
                    </div>
                ) : (
                    <div style={styles.bioBox}>{profile.bio || "Pas de bio."}</div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: "flex", justifyContent: "center", padding: "20px" },
    card: { width: "400px", background: "#111", borderRadius: "20px", padding: "25px", color: "white" },
    header: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" },
    avatar: { width: "70px", height: "70px", borderRadius: "50%", border: "2px solid #6c63ff" },
    username: { margin: 0, fontSize: "1.2rem" },
    email: { margin: 0, opacity: 0.5, fontSize: "0.9rem" },
    bioBox: { background: "#1a1a1a", padding: "15px", borderRadius: "10px", fontSize: "14px" },
    input: { width: "100%", background: "#222", border: "1px solid #333", color: "white", padding: "10px", borderRadius: "8px", marginBottom: "10px" },
    btnPrimary: { background: "#6c63ff", color: "white", border: "none", padding: "10px", borderRadius: "8px", width: "100%", cursor: "pointer" },
    btnSecondary: { background: "#222", color: "white", border: "1px solid #333", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }
};