import { rss } from "./lib";

rss({
  storage: {
    type: "mongodb",
    uri: process.env.MONGODB_URI!,
  },
  forward: {
    type: "atp",
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  },
  feeds: [
    "https://xkcd.com/rss.xml",
    "https://github.blog/feed",
    "https://this-week-in-rust.org/rss.xml",
    "https://blog.chromium.org/atom.xml",
    "https://css-tricks.com/feed/",
    "https://overreacted.io/rss.xml",
    "https://reactjs.org/feed.xml",
    "https://blog.cloudflare.com/rss/", // note the trailing slash is necessary
    "https://blog.rust-lang.org/feed.xml",
    "https://www.swyx.io/rss.xml",
    "https://devblogs.microsoft.com/typescript/feed/",
    "https://blog.vuejs.org/feed.rss",
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
    "https://inside.pixiv.blog/rss",
    "https://www.swift.org/atom.xml",
    "https://engineering.mercari.com/blog/feed.xml/",
    "https://testing.googleblog.com/feeds/posts/default",
    "https://tailscale.com/blog/index.xml",
    "https://spidermonkey.dev/feed.xml",
    "https://deno.com/feed",
    "https://fly.io/blog/feed.xml",
    "https://blog.jetbrains.com/feed/",
    "https://vercel.com/atom",
    "https://nerdy.dev/rss.xml",
    "https://api.quantamagazine.org/feed/",
    "https://bsky.social/about/rss.xml",
    "https://bevyengine.org/atom.xml",
    "https://bughunters.google.com/feed/en",
  ],
  rules({ index }) {
    return {
      cron: `0 ${index % 24} * * *`,
    };
  },
});
