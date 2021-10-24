import type { Storage, RawFeed, StorageFeedItem } from "../type";
import path from "path";
import fs from "fs/promises";
import yaml from "js-yaml";
import { storageHelper } from "../shared";

const content = path.join(process.cwd(), "content");
console.log(`using ${content} as content dir`);

interface SavedFeedInfo {
  title: string;
  url: string;
  items: StorageFeedItem[];
}

const serializer = {
  parse(input: string) {
    return yaml.load(input) as SavedFeedInfo;
  },
  format(feed: RawFeed) {
    return yaml.dump(feed);
  },
};

export type LocalStorageConfig = {
  type: "local";
};

export const local: Storage<LocalStorageConfig> = {
  async init() {
    return {
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

        const updates = storageHelper.getValidItems(feed).filter((item) => {
          return !urls?.has(item.link);
        });

        const updated: SavedFeedInfo = {
          title: feed.title,
          url,
          items: [...updates, ...(saved?.items ?? [])],
        };

        await fs.writeFile(localPath, serializer.format(updated));
        return updates;
      },
    };
  },
};
