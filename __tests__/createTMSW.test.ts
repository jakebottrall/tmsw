import { TRPCError } from "@trpc/server";
import { setupServer } from "msw/node";
import "whatwg-fetch";
import { createTMSW } from "../src";
import { trpc } from "./client";
import { type AppRouter } from "./server";

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
});
