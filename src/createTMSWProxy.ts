import {
  defaultTransformer,
  getTRPCErrorFromUnknown,
  type AnyRouter,
  type DefaultErrorShape,
  type TRPCError,
} from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { rest } from "msw";

import { type CreateTMSWConfig, type TRPCResponseResolver } from "./createTMSW";

interface GetErrorShapeOpts {
  error: TRPCError;
  path?: string;
}

/** Adapted from https://github.com/trpc/trpc/blob/main/packages/server/src/core/router.ts#L312 */
const getErrorShape = (opts: GetErrorShapeOpts) => {
  const { path, error } = opts;

  const shape: DefaultErrorShape = {
    message: error.message,
    code: TRPC_ERROR_CODES_BY_KEY[error.code],
    data: {
      code: error.code,
      httpStatus: getHTTPStatusCodeFromError(error),
      path,
    },
  };

  return shape;
};

export const createTMSWProxy = (
  config: CreateTMSWConfig,
  path = ""
): unknown => {
  const { basePath = "trpc", transformer = defaultTransformer } = config;

  return new Proxy(
    {},
    {
      get: (_target, key: string) => {
        const method =
          key === "query" ? "get" : key === "mutation" ? "post" : null;

        if (!method) {
          const newPath = !path ? `/${basePath}/${key}` : `${path}.${key}`;
          return createTMSWProxy({ transformer }, newPath);
        }

        return (handler: TRPCResponseResolver<AnyRouter, keyof AnyRouter>) => {
          return rest[method](path, (req, res, ctx) => {
            try {
              return handler(req, res, {
                ...ctx,
                data: (body) =>
                  ctx.json({
                    result: {
                      data: transformer.input.serialize(body) as unknown,
                    },
                  }),
              });
            } catch (cause) {
              const error = getTRPCErrorFromUnknown(cause);
              const shape = getErrorShape({ error, path });

              return res(
                ctx.status(shape.data.httpStatus),
                ctx.json({
                  error: transformer.input.serialize({
                    ...shape,
                    shape,
                  }) as unknown,
                })
              );
            }
          });
        };
      },
    }
  );
};
