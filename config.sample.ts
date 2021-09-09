import { rss } from "./lib";

rss({
  storage: "local",
  forward: {
    type: "telegram",
    token: process.env.TG_TOKEN!,
    chatId: process.env.TG_CHAT_ID!,
  },
  feeds: [
    "https://blog.chromium.org/atom.xml",
    "https://css-tricks.com/feed/",
    "https://reactjs.org/feed.xml",
    "https://blog.rust-lang.org/feed.xml",
    "https://devblogs.microsoft.com/typescript/feed",
    "https://news.vuejs.org/feed.xml",
  ],
  rules: [
    {
      regex: /css|vue/,
      format: (feed) => feed.link,
    },
  ],
});
