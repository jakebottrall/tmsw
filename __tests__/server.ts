import { initTRPC } from "@trpc/server";
import { z } from "zod";

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

export type AppRouter = typeof appRouter;
