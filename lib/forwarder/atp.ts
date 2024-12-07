import type { Forwarder, ForwarderItem } from "../type";
import { AppBskyFeedPost, AtpAgent, RichText } from "@atproto/api";
import ogs from "open-graph-scraper";

export interface AtpConfig {
  type: "atp";
  identifier: string;
  password: string;
}

export const atp: Forwarder<AtpConfig> = {
  async init(config) {
    const agent = new AtpAgent({
      service: "https://bsky.social",
    });

    await agent.login(config);

    // https://docs.bsky.app/docs/advanced-guides/rate-limits#content-write-operations-per-account
    // The limit is 5,000 points per hour and 35,000 points per day.
    // const limit = 5000 / 100;
    const limit = 5;

    return {
      async send(items) {
        const individualSends = items.slice(0, limit);

        await Promise.all(
          individualSends.map(async (item) => {
            const rt = new RichText({ text: item.content });
            await rt.detectFacets(agent);
            const record = {
              text: rt.text,
              facets: rt.facets,
            };

            const embed = await getEmbed(agent, item).catch((e) => {
              console.error(e);
              return null;
            });

            if (!embed) {
              return agent.post(record);
            }

            return agent.post({ ...record, ...embed });
          })
        );
      },
    };
  },
};

async function getEmbed(
  agent: AtpAgent,
  item: ForwarderItem
): Promise<Partial<AppBskyFeedPost.Record>> {
  const og = await ogs({ url: item.url });
  if (og.error) throw new Error("failed to fetch ogp");

  const ogImage = og.result.ogImage?.[0];
  if (!ogImage?.url)
    return {
      embed: {
        $type: "app.bsky.embed.external",
        external: {
          uri: item.url,
          title: og.result.ogTitle,
          description: og.result.ogDescription,
        },
      },
    };

  const ogImageRes = await fetch(ogImage.url);
  const ogImageBuffer = await ogImageRes.arrayBuffer();
  const uploadRes = await agent.uploadBlob(new Uint8Array(ogImageBuffer));

  return {
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: item.url,
        thumb: {
          $type: "blob",
          ref: uploadRes.data.blob.ref,
          mimeType: uploadRes.data.blob.mimeType,
          size: uploadRes.data.blob.size,
        },
        title: og.result.ogTitle,
        description: og.result.ogDescription,
      },
    },
  };
}
