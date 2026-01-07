let messages = [];

function addMessage(content, userId) {
  if (!content || !content.trim()) {
    throw new Error("Message vide");
  }

  const message = {
    id: messages.length + 1,
    content,
    userId
  };

  messages.push(message);
  return message;
}

function deleteMessage(id, userId) {
  const index = messages.findIndex(
    m => m.id === id && m.userId === userId
  );

  if (index === -1) {
    throw new Error("Message introuvable ou non autorisé");
  }

  messages.splice(index, 1);
  return true;
}

function clearMessages() {
  messages = [];
}

module.exports = { addMessage, deleteMessage, clearMessages };
