import type { Forwarder } from "../type";

export interface TGConfig {
  type: "telegram";
  token: string;
  chatId: string;
}

import TelegramBot from "node-telegram-bot-api";

export const telegram: Forwarder<TGConfig> = {
  init(config) {
    const bot = new TelegramBot(config.token, { polling: false });
    return {
      async send(items) {
        await Promise.all(
          items.map((item) => {
            return bot.sendMessage(config.chatId, item, {});
          })
        );
      },
    };
  },
};
