import dotenv from "dotenv";
dotenv.config();
import { build } from "esbuild";

const ENV_KEYS = [
  "TG_TOKEN",
  "TG_CHAT_ID",
  "MONGODB_URI",
  "BLUESKY_USERNAME",
  "BLUESKY_PASSWORD",
];

const define = Object.fromEntries(
  ENV_KEYS.filter((k) => process.env[k]).map((k) => [
    `process.env.${k}`,
    JSON.stringify(process.env[k]),
  ])
);

build({
  platform: "node",
  entryPoints: ["./config.ts"],
  outfile: "./dist/rss.js",
  bundle: true,
  define,
}).catch(() => process.exit(1));
