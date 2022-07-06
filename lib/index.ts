import cron from "node-cron";
import { Cron as c } from "cron-infer";
import Parser from "rss-parser";
import type {
  RSSConfig,
  RSSContext,
  RSSFeedSource,
  RSSFeedSourceOrUrl,
} from "./type";
import { telegram } from "./forwarder/telegram";
import { local } from "./storage/local";
import { mongodb } from "./storage/mongodb";

export async function rss(config: RSSConfig) {
  const ctx = {
    config,
    parser: new Parser(),
    forwarder: { telegram }[config.forward.type].init(config.forward),
    storage: await { local, mongodb }[config.storage.type].init(
      // here config.storage is guaranteed to have correct config type
      config.storage as any
    ),
  };

  config.feeds.map((feed, index) => {
    cron.schedule(...toJob({ ctx, feed, index }));
  });

  await ctx.forwarder.send([`rss server started!`]);
}

function toJob({
  ctx,
  feed,
  index,
}: {
  ctx: RSSContext;
  feed: RSSFeedSourceOrUrl;
  index: number;
}): Parameters<typeof cron["schedule"]> {
  const feedSource = typeof feed === "string" ? {
    url: feed,
  } : feed;

  const source: Required<RSSFeedSource> = {
    cron: c("0 12 * * *"),
    format(item) {
      return [item.title, item.link].join("\n\n");
    },
    ...ctx.config.rules?.({ feed, index }),
    ...feedSource
  };

  const process = async () => {
    try {
      const feedData = await ctx.parser.parseURL(source.url);
      const updates = await ctx.storage.update(source.url, feedData);

      // await forwarder.send([`${updates.length} updates for ${feedData.title}`]);
      if (!updates.length) return;

      const items = updates.map(source.format);
      await ctx.forwarder.send(items);
    } catch (e) {
      console.error(`some error happened in processing feed ${source.url}: ${e}`);
    }
  };
  // sync on server start
  process().catch(console.error);
  return [source.cron, process];
}
