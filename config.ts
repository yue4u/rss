import { rss } from "./lib";

rss({
  storage: {
    type: "mongodb",
    uri: process.env.MONGODB_URI!,
  },
  forward: {
    type: "telegram",
    token: process.env.TG_TOKEN!,
    chatId: process.env.TG_CHAT_ID!,
    limit: 10,
  },
  feeds: [
    "https://xkcd.com/rss.xml",
    "https://github.blog/feed",
    "https://this-week-in-rust.org/rss.xml",
    "https://coolshell.cn/feed",
    "https://blog.chromium.org/atom.xml",
    "https://css-tricks.com/feed/",
    "https://overreacted.io/rss.xml",
    "https://reactjs.org/feed.xml",
    "https://blog.cloudflare.com/rss/", // note the trailing slash is necessary
    "https://blog.rust-lang.org/feed.xml",
    "https://rustmagazine.github.io/rust_magazine_2021/rss.xml",
    "https://www.swyx.io/rss.xml",
    "https://devblogs.microsoft.com/typescript/feed",
    "https://news.vuejs.org/feed.xml",
    "https://webgl.souhonzan.org/rss",
    "https://engineering.fb.com/feed",
    "https://devblogs.microsoft.com/landingpage",
    "https://kentcdodds.com/blog/rss.xml",
    "https://jasonformat.com/posts.rss",
    "https://godotengine.org/rss.xml",
    "https://blog.unity.com/feed",
    "https://blog.mozilla.org/feed",
    "https://web.dev/feed.xml",
    "https://v8.dev/blog.atom",
    "https://blog.google/rss/",
    "https://nodejs.org/en/feed/blog.xml",
    "https://vuedose.tips/rss",
    "https://inside.pixiv.blog/rss",
    "https://www.swift.org/atom.xml",
  ],
  rules: [
    {
      regex: /css|vue/,
      format: (feed) => feed.link,
    },
    {
      regex: /./,
      cron: ({ index }) => `0 ${index % 24} * * *`,
    },
  ],
});
