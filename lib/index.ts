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
import { atp } from "./forwarder/atp";
import { local } from "./storage/local";
import { mongodb } from "./storage/mongodb";

export async function rss(config: RSSConfig) {
  const ctx = {
    config,
    parser: new Parser(),
    forwarder: await { telegram, atp }[config.forward.type].init(
      // @ts-expect-error
      config.forward
    ),
    storage: await { local, mongodb }[config.storage.type].init(
      // @ts-expect-error
      config.storage
    ),
  };

  config.feeds.map((feed, index) => {
    cron.schedule(...toJob({ ctx, feed, index }));
  });

  // await ctx.forwarder.send([`rss server started!`]);
}

function toJob({
  ctx,
  feed,
  index,
}: {
  ctx: RSSContext;
  feed: RSSFeedSourceOrUrl;
  index: number;
}): Parameters<(typeof cron)["schedule"]> {
  const feedSource =
    typeof feed === "string"
      ? {
          url: feed,
        }
      : feed;

  const source: Required<RSSFeedSource> = {
    cron: c("0 12 * * *"),
    format(item) {
      return {
        title: item.title,
        url: item.link,
        content: [item.title, item.link].join("\n\n"),
      };
    },
    ...ctx.config.rules?.({ feed, index }),
    ...feedSource,
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
      console.error(
        `some error happened in processing feed ${source.url}: ${e}`
      );
    }
  };
  // sync on server start
  process().catch(console.error);
  return [source.cron, process];
}
