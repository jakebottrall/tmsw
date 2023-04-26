import {
  type AnyRouter,
  type BuildProcedure,
  type CombinedDataTransformer,
} from "@trpc/server";
import {
  type DefaultBodyType,
  type ResponseResolver,
  type ResponseTransformer,
  type RestContext,
  type RestHandler,
  type RestRequest,
} from "msw";
import { createTMSWProxy } from "./createTMSWProxy";

export type QueryProcedure = BuildProcedure<"query", any, any>;
export type MutationProcedure = BuildProcedure<"mutation", any, any>;

export type TRPCContext<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = RestContext & {
  data: (
    data: Router[Key] extends BuildProcedure<any, any, infer P> ? P : never
  ) => ResponseTransformer<DefaultBodyType>;
};

export type TRPCResponseResolver<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = ResponseResolver<RestRequest, TRPCContext<Router, Key>, DefaultBodyType>;

export type TRPCMutation<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = {
  mutation: (resolver: TRPCResponseResolver<Router, Key>) => RestHandler;
};

export type TRPCQuery<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = {
  query: (resolver: TRPCResponseResolver<Router, Key>) => RestHandler;
};

export type ExtractKeys<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = Router[Key] extends QueryProcedure | MutationProcedure | AnyRouter
  ? Key
  : never;

export type ExtractProcedureHandler<
  Router extends AnyRouter,
  Key extends keyof Router = keyof Router
> = Router[Key] extends MutationProcedure
  ? TRPCMutation<Router, Key>
  : Router[Key] extends QueryProcedure
  ? TRPCQuery<Router, Key>
  : Router[Key] extends AnyRouter
  ? TMSW<Router[Key]>
  : never;

export type TMSW<Router extends AnyRouter> = {
  [key in keyof Router as ExtractKeys<Router, key>]: ExtractProcedureHandler<
    Router,
    key
  >;
};

export interface CreateTMSWConfig {
  basePath?: string;
  transformer?: CombinedDataTransformer;
}

export const createTMSW = <Router extends AnyRouter>(
  config: CreateTMSWConfig = {}
) => {
  return createTMSWProxy(config) as TMSW<Router>;
};
