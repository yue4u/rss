import dotenv from "dotenv";
dotenv.config();
import Parser from "rss-parser";
import type { RSSConfig, RSSFeed } from "./type";
import { telegram } from "./forwarder/telegram";
import { local } from "./storage/local";

export async function rss(config: RSSConfig) {
  const parser = new Parser();
  const forwarder = { telegram }[config.forward.type].init(config.forward);
  const storage = { local }[config.storage];

  await Promise.all(config.feeds.map(processFeed));

  async function processFeed(feed: RSSFeed) {
    const url = typeof feed === "string" ? feed : feed.url;
    const feedData = await parser.parseURL(url);
    const updates = await storage.update(url, feedData);

    console.log(`${updates.length} updates for ${feedData.title}`);
    if (!updates.length) return;

    const rule = config.rules?.find((rule) => rule.regex.test(url));
    const formatter =
      rule?.format || ((item) => [item.title, item.link].join("\n\n"));

    const items = updates.map(formatter);
    await forwarder.send(items);
  }
}
