export default {
  async fetch(request, _env, _ctx): Promise<Response> {
    if (new URL(request.url).pathname === "/.well-known/atproto-did") {
      return new Response("did:plc:ulbofwk3yjuybzxbzu4ckcsd", {
        headers: { "content-type": "text/plain" },
      });
    }

    return new Response(undefined, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
