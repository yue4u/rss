import cron from "node-cron";
import { Cron as c } from "cron-infer";
import Parser from "rss-parser";
import type { RSSConfig, RSSFeed } from "./type";
import { telegram } from "./forwarder/telegram";
import { local } from "./storage/local";

export async function rss(config: RSSConfig) {
  const parser = new Parser();
  const forwarder = { telegram }[config.forward.type].init(config.forward);
  const storage = { local }[config.storage];

  config.feeds.map((feed) => {
    cron.schedule(...toJob(feed));
  });
  await forwarder.send([`rss server started!`]);

  function toJob(feed: RSSFeed): Parameters<typeof cron["schedule"]> {
    return [
      // this is wrong but short and works..
      feed["cron" as keyof RSSFeed] ?? c("0 12 * * *"),
      () => processFeed(feed),
    ];
  }

  async function processFeed(feed: RSSFeed) {
    const url = typeof feed === "string" ? feed : feed.url;
    try {
      const feedData = await parser.parseURL(url);
      const updates = await storage.update(url, feedData);

      await forwarder.send([`${updates.length} updates for ${feedData.title}`]);
      if (!updates.length) return;

      const rule = config.rules?.find((rule) => rule.regex.test(url));
      const formatter =
        rule?.format || ((item) => [item.title, item.link].join("\n\n"));

      const items = updates.map(formatter);
      await forwarder.send(items);
    } catch (e) {
      console.error(`some error happened in processing feed ${url}: ${e}`);
    }
  }
}
