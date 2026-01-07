const {
  addMessage,
  deleteMessage,
  clearMessages
} = require('../src/chat/chat.service');

describe("Test unitaire – Chat", () => {

  beforeEach(() => clearMessages());

  test("Ajout message valide", () => {
    const msg = addMessage("Bonjour", 1);
    expect(msg.content).toBe("Bonjour");
  });

  test("Message vide refusé", () => {
    expect(() => addMessage("", 1)).toThrow();
  });

  test("Suppression message (menu)", () => {
    const msg = addMessage("À supprimer", 2);
    expect(deleteMessage(msg.id, 2)).toBe(true);
  });

  test("Suppression interdite", () => {
    const msg = addMessage("Privé", 3);
    expect(() => deleteMessage(msg.id, 1)).toThrow();
  });

});
