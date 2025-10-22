import { serve } from "bun";
import index from "./index.html";
import { createEndpoint, createRouter } from "better-call";
import z from "zod";

const createItem = createEndpoint(
  "/item",
  {
    method: "POST",
    body: z.object({
      id: z.string(),
    }),
  },
  async (ctx) => {
    return {
      item: {
        id: ctx.body.id,
      },
    };
  },
);

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
