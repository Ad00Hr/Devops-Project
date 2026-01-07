const API = "http://localhost:3000/api/chat/messages";

function assert(cond, msg) {
  cond ? console.log("✅", msg) : console.error("❌", msg);
}

(async function runChatTest() {
  const token = localStorage.getItem("token");
  assert(token, "Token présent");

  const headers = { Authorization: `Bearer ${token}` };

  const resGet = await fetch(API, { headers });
  assert(resGet.status === 200, "Chargement messages");

  const resPost = await fetch(API, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: "Message fonctionnel" })
  });

  const data = await resPost.json();
  assert(data.id, "Message envoyé");

  const resDel = await fetch(`${API}/${data.id}`, {
    method: "DELETE",
    headers
  });

  assert(resDel.status === 200, "Message supprimé (🗑)");
})();
