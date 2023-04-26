import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { type AppRouter } from "./server";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: "/trpc",
      headers: () => ({ "content-type": "application/json" }),
    }),
  ],
});
