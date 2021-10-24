import { MongoClient, MongoBulkWriteError, OneOrMore } from "mongodb";
import { storageHelper } from "../shared";
import type { Storage } from "../type";

const asArray = <T>(items: OneOrMore<T>): T[] => {
  return Array.isArray(items) ? items : [items];
};

export interface MongodbStorageConfig {
  type: "mongodb";
  uri: string;
}

export const mongodb: Storage<MongodbStorageConfig> = {
  async init(config) {
    const client = await new MongoClient(config.uri).connect();
    const collection = client.db("rss").collection("feeds");
    await collection.createIndex("link", { unique: true });

    return {
      async update(_, feeds) {
        const items = storageHelper.getValidItems(feeds);
        try {
          const r = await collection.insertMany(items, { ordered: false });
          console.log(`inserted ${r.insertedCount}`);
          return items;
        } catch (e) {
          if (!(e instanceof MongoBulkWriteError)) throw e;

          const exists = new Set(
            asArray(e.writeErrors).map((e) => e.getOperation().link)
          );
          return items.filter((item) => !exists.has(item.link));
        }
      },
    };
  },
};
