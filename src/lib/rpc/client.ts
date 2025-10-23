import { createClient } from "better-call/client";
import type { router } from "./routes";

export const apiClient = createClient<typeof router>({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
});
