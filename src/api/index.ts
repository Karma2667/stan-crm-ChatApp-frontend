export const api = {
  // Другие заглушки
  updateMessage: async (chatId: number, messageId: string, newText: string) => {
    console.log(`API stub: update message in chat ${chatId}, id=${messageId}, new text="${newText}"`);
    // Возвращаем то, что обычно вернул бы бэкенд
    return Promise.resolve({
      success: true,
      message: { id: messageId, text: newText },
    });
  },
};
