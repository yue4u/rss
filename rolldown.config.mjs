import dotenv from "dotenv";
import { defineConfig } from "rolldown";
dotenv.config();

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

export default defineConfig({
  input: "config.ts",
  platform: "node",
  define,
  output: {
    format: "cjs",
    file: "dist/rss.js",
  },
});
