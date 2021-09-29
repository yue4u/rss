import type { Storage, RawFeed, SavedFeedInfo, FeedItem } from "../type";
import path from "path";
import fs from "fs/promises";
import yaml from "js-yaml";

const content = path.join(process.cwd(), "content");
console.log(`using ${content} as content dir`);

const serializer = {
  parse(input: string) {
    return yaml.load(input) as SavedFeedInfo;
  },
  format(feed: RawFeed) {
    return yaml.dump(feed);
  },
};

const toSaved = ({
  title,
  link,
  isoDate,
}: FeedItem): SavedFeedInfo["items"][number] => {
  return {
    title,
    link,
    isoDate,
  };
};

export const local: Storage = {
  async update(url, feed) {
    if (!feed.title) throw `no title in feed ${feed.title}`;

    const localPath = path.join(
      content,
      `${feed.title.replaceAll("/", "-")}.yml`
    );
    let saved: SavedFeedInfo | null = null;
    let urls: Set<string> | null = null;
    try {
      const localContent = await fs.readFile(localPath, "utf8");
      saved = serializer.parse(localContent);
      urls = new Set(saved.items.map((i) => i.link));
    } catch {}

    const updates = feed.items.filter((item) => {
      return item.link && !urls?.has(item.link);
    }) as FeedItem[];

    const updated: SavedFeedInfo = {
      title: feed.title,
      url,
      items: [...updates.map(toSaved), ...(saved?.items ?? [])],
    };

    await fs.writeFile(localPath, serializer.format(updated));
    return updates;
  },
};
