import type { FeedItem, RawFeed, StorageFeedItem } from "./type";

export const storageHelper = {
  getValidItems(feed: RawFeed): FeedItem[] {
    return feed.items
      .filter((item) => item.link)
      .map((item) => {
        return storageHelper.toSaved(item as FeedItem);
      });
  },
  toSaved({ title, link, isoDate }: FeedItem): StorageFeedItem {
    return {
      title,
      link,
      isoDate,
    };
  },
};
