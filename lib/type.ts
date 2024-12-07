import type { TGConfig } from "./forwarder/telegram";
import type { default as Parser } from "rss-parser";
import type { LocalStorageConfig } from "./storage/local";
import type { MongodbStorageConfig } from "./storage/mongodb";
import type { AtpConfig } from "./forwarder/atp";

export type RawFeed = ReturnType<Parser["parseURL"]> extends Promise<infer T>
  ? T
  : never;

export interface RSSFeedSource extends RSSFeedSourceConfig {
  url: string;
}
export type RSSFeedSourceOrUrl = RSSFeedSource | string;

type RSSForwardConfig = TGConfig | AtpConfig;
export type FeedItem = RawFeed["items"][number] & { link: string };

export interface ItemFormatter {
  (feed: FeedItem): ForwarderItem;
}

export interface RSSContext {
  config: RSSConfig;
  parser: Parser;
  forwarder: ForwarderInstance;
  storage: StorageInstance;
}

export type RSSFeedSourceConfig = {
  cron?: string;
  format?: ItemFormatter;
};

export interface RSSConfig {
  storage: LocalStorageConfig | MongodbStorageConfig;
  forward: RSSForwardConfig;
  feeds: RSSFeedSourceOrUrl[];
  rules?: (source: {
    feed: RSSFeedSourceOrUrl;
    index: number;
  }) => RSSFeedSourceConfig;
}

export interface Forwarder<C> {
  init(config: C): ForwarderInstance | Promise<ForwarderInstance>;
}

export interface ForwarderInstance {
  send(items: ForwarderItem[]): Promise<void>;
}

export interface ForwarderItem {
  title?: string;
  url: string;
  content: string;
}

export interface Storage<C> {
  init(config: C): Promise<StorageInstance>;
}

export interface StorageInstance {
  update(url: string, feed: RawFeed): Promise<FeedItem[]>;
}

export interface StorageFeedItem {
  title?: string;
  link: string;
  isoDate?: string;
}
