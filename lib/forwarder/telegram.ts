import type { Forwarder } from "../type";

export interface TGConfig {
  type: "telegram";
  token: string;
  chatId: string;
  limit?: number;
}

import TelegramBot from "node-telegram-bot-api";

function pluralize(n: number) {
  const suffix = new Intl.PluralRules("en-US").select(n) === "one" ? "" : "s";
  return `${n} item${suffix}`;
}

export const telegram: Forwarder<TGConfig> = {
  init(config) {
    const bot = new TelegramBot(config.token, { polling: false });
    return {
      async send(items) {
        const individualSends = items.slice(0, config.limit ?? items.length);
        const extra = items.slice(individualSends.length);

        await Promise.all(
          individualSends.map((item) => {
            return bot.sendMessage(config.chatId, item.content, {});
          })
        );

        if (extra.length <= 0) return;

        const rest = [
          `...and ${pluralize(extra.length)} more:`, //
          ...extra,
        ].join("\n\n");

        await bot.sendMessage(config.chatId, rest);
      },
    };
  },
};
