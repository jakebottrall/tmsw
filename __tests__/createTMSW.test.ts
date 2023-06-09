import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { TRPCError, initTRPC } from "@trpc/server";
import { setupServer } from "msw/node";
import superjson from "superjson";
import "whatwg-fetch";
import { z } from "zod";
import { createTMSW } from "../src";

const t = initTRPC.create();

const appRouter = t.router({
  getManyCountries: t.procedure.query(() => {
    return [
      { name: "Canada", continent: "North America" },
      { name: "Australia", continent: "Oceania" },
      { name: "Thailand", continent: "Asia" },
    ];
  }),
  addOneCountry: t.procedure
    .input(z.object({ name: z.string(), continent: z.string() }))
    .mutation(({ input }) => {
      const newCountry = { ...input };
      return newCountry;
    }),
  nested: t.router({
    getManyCities: t.procedure.query(() => {
      return [
        { name: "Vancouver", country: "Canada" },
        { name: "Gold Coast", country: "Australia" },
        { name: "Bangkok", country: "Thailand" },
      ];
    }),
    addOneCity: t.procedure
      .input(z.object({ name: z.string(), country: z.string() }))
      .mutation(({ input }) => {
        const newCity = { ...input };
        return newCity;
      }),
  }),
});

type AppRouter = typeof appRouter;

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: "/trpc",
      headers: () => ({ "content-type": "application/json" }),
    }),
  ],
});

const tmsw = createTMSW<AppRouter>();

const server = setupServer(
  tmsw.getManyCountries.query((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data([{ name: "Tanzania", continent: "Africa" }])
    );
  }),
  tmsw.addOneCountry.mutation((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({ name: "Tanzania", continent: "Africa" })
    );
  }),
  tmsw.nested.getManyCities.query((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data([{ name: "Dodoma", country: "Tanzania" }])
    );
  }),
  tmsw.nested.addOneCity.mutation((req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.data({ name: "Dodoma", country: "Tanzania" })
    );
  })
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("createTMSW", () => {
  describe("queries", () => {
    it("returns successful responses", async () => {
      const res = await trpc.getManyCountries.query();
      expect(res).toStrictEqual([{ name: "Tanzania", continent: "Africa" }]);
    });

    it("returns unsuccessful responses", async () => {
      server.use(
        tmsw.getManyCountries.query(() => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Oops. Something went wrong",
          });
        })
      );

      await expect(trpc.getManyCountries.query()).rejects.toThrow(
        "Oops. Something went wrong"
      );
    });
  });

  describe("mutations", () => {
    it("returns successful responses", async () => {
      const res = await trpc.addOneCountry.mutate({
        name: "Tanzania",
        continent: "Africa",
      });
      expect(res).toEqual({ name: "Tanzania", continent: "Africa" });
    });

    it("returns unsuccessful responses", async () => {
      server.use(
        tmsw.addOneCountry.mutation(() => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Oops. Something went wrong",
          });
        })
      );

      await expect(
        trpc.addOneCountry.mutate({
          name: "Tanzania",
          continent: "Africa",
        })
      ).rejects.toThrow("Oops. Something went wrong");
    });
  });

  describe("nested", () => {
    describe("queries", () => {
      it("returns successful responses", async () => {
        const res = await trpc.nested.getManyCities.query();
        expect(res).toStrictEqual([{ name: "Dodoma", country: "Tanzania" }]);
      });

      it("returns unsuccessful responses", async () => {
        server.use(
          tmsw.nested.getManyCities.query(() => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Oops. Something went wrong",
            });
          })
        );

        await expect(trpc.nested.getManyCities.query()).rejects.toThrow(
          "Oops. Something went wrong"
        );
      });
    });

    describe("mutations", () => {
      it("returns successful responses", async () => {
        const res = await trpc.nested.addOneCity.mutate({
          name: "Dodoma",
          country: "Tanzania",
        });
        expect(res).toEqual({ name: "Dodoma", country: "Tanzania" });
      });

      it("returns unsuccessful responses", async () => {
        server.use(
          tmsw.nested.addOneCity.mutation(() => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Oops. Something went wrong",
            });
          })
        );

        await expect(
          trpc.nested.addOneCity.mutate({ name: "Dodoma", country: "Tanzania" })
        ).rejects.toThrow("Oops. Something went wrong");
      });
    });
  });

  describe("config", () => {
    describe("basePath", () => {
      const tmswWithBasePath = createTMSW<AppRouter>({
        basePath: "api/trpc",
      });

      const trpcWithBasePath = createTRPCProxyClient<AppRouter>({
        links: [
          httpLink({
            url: "api/trpc",
            headers: () => ({ "content-type": "application/json" }),
          }),
        ],
      });

      it("changes the base path of the handlers", async () => {
        server.use(
          tmswWithBasePath.getManyCountries.query((req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.data([{ name: "Tanzania", continent: "Africa" }])
            );
          })
        );

        const res = await trpcWithBasePath.getManyCountries.query();
        expect(res).toStrictEqual([{ name: "Tanzania", continent: "Africa" }]);
      });
    });

    describe("transformer", () => {
      const tWithTransformer = initTRPC.create({ transformer: superjson });

      const appRouterWithTransformer = tWithTransformer.router({
        getManyCountries: t.procedure.query(() => {
          return [
            { name: "Canada", continent: "North America" },
            { name: "Australia", continent: "Oceania" },
            { name: "Thailand", continent: "Asia" },
          ];
        }),
      });

      type AppRouterWithTransformer = typeof appRouterWithTransformer;

      const tmswWithTransformer = createTMSW<AppRouterWithTransformer>({
        transformer: {
          input: {
            serialize: superjson.serialize,
            deserialize: superjson.deserialize,
          },
          output: {
            serialize: superjson.serialize,
            deserialize: superjson.deserialize,
          },
        },
      });

      const trpcWithTransformer =
        createTRPCProxyClient<AppRouterWithTransformer>({
          transformer: superjson,
          links: [
            httpLink({
              url: "trpc",
              headers: () => ({ "content-type": "application/json" }),
            }),
          ],
        });

      it("changes serializes the response", async () => {
        server.use(
          tmswWithTransformer.getManyCountries.query((req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.data([{ name: "Tanzania", continent: "Africa" }])
            );
          })
        );

        const res = await trpcWithTransformer.getManyCountries.query();
        expect(res).toStrictEqual([{ name: "Tanzania", continent: "Africa" }]);
      });
    });
  });
});
