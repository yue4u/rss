import type { TGConfig } from "./forwarder/telegram";
import type { default as Parser } from "rss-parser";

export type RawFeed = ReturnType<Parser["parseURL"]> extends Promise<infer T>
  ? T
  : never;

export type RSSFeedSource = ({ url: string } & FeedConfig) | string;

type RSSForwardConfig = TGConfig;
export type FeedItem = RawFeed["items"][number] & { link: string };

export interface ItemFormatter {
  (feed: FeedItem): string;
}

export interface RSSContext {
  config: RSSConfig;
  parser: Parser;
  forwarder: ForwarderInstance;
  storage: Storage;
}

export type FeedCronConfig = (source: {
  feed: RSSFeedSource;
  index: number;
}) => string | string;

export type FeedConfig = {
  cron?: FeedCronConfig;
  format?: ItemFormatter;
};

export interface RSSConfig {
  storage: "local";
  forward: RSSForwardConfig;
  feeds: RSSFeedSource[];
  rules?: ({
    regex: RegExp;
  } & FeedConfig)[];
}

export interface Forwarder<C> {
  init(config: C): ForwarderInstance;
}

export interface ForwarderInstance {
  send(items: string[]): Promise<void>;
}

export interface Storage {
  update(url: string, feed: RawFeed): Promise<FeedItem[]>;
}

export interface SavedFeedInfo {
  title: string;
  url: string;
  items: { title?: string; link: string; isoDate?: string }[];
}
