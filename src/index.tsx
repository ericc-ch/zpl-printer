import { serve } from "bun";
import index from "./index.html";
import { router } from "./lib/rpc/routes";

const server = serve({
  routes: {
    "/*": index,
  },
  fetch: router.handler,

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
