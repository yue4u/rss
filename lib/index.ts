import cron from "node-cron";
import { Cron as c } from "cron-infer";
import Parser from "rss-parser";
import type {
  FeedCronConfig,
  RSSConfig,
  RSSContext,
  RSSFeedSource,
} from "./type";
import { telegram } from "./forwarder/telegram";
import { local } from "./storage/local";

export async function rss(config: RSSConfig) {
  const ctx = {
    config,
    parser: new Parser(),
    forwarder: { telegram }[config.forward.type].init(config.forward),
    storage: { local }[config.storage],
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
  feed: RSSFeedSource;
  index: number;
}): Parameters<typeof cron["schedule"]> {
  const url = typeof feed === "string" ? feed : feed.url;
  const rule = ctx.config.rules?.find((rule) => rule.regex.test(url));
  const formatter =
    rule?.format || ((item) => [item.title, item.link].join("\n\n"));

  const getCron = (cronConfig?: FeedCronConfig | null): string | null => {
    if (!cronConfig) return null;

    return typeof cronConfig === "string"
      ? cronConfig
      : cronConfig({ feed, index });
  };

  const jobCron =
    // this casting is wrong but short and works..
    getCron(feed["cron" as keyof RSSFeedSource]) ||
    getCron(rule?.cron) ||
    c("0 12 * * *");

  const process = async () => {
    try {
      const feedData = await ctx.parser.parseURL(url);
      const updates = await ctx.storage.update(url, feedData);

      // await forwarder.send([`${updates.length} updates for ${feedData.title}`]);
      if (!updates.length) return;

      const items = updates.map(formatter);
      await ctx.forwarder.send(items);
    } catch (e) {
      console.error(`some error happened in processing feed ${url}: ${e}`);
    }
  };

  return [jobCron, process];
}
