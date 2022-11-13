import { pipe } from "fp-ts/lib/function";
import { asks, chain, fromTaskEither, map } from "fp-ts/lib/ReaderTaskEither";
import {
  map as TEmap,
  of,
  tryCatch,
  chain as TEchain,
} from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { createClient } from "redis";
import { Action, ActionResult } from "../domain/action";
import { Env } from "../domain/env";
import { fromJsError } from "../domain/error";

type RedisClient = ReturnType<typeof createClient>;
export type RedisApi = {
  set: <T extends {}>(
    decoder: t.Type<T>
  ) => (key: string, obj: T) => ActionResult<T>;
  // get: <T extends {}>(decoder: t.Type<T>) => (key: string) => ActionResult<T>;
};

const fromClient = (client: RedisClient): RedisApi => {
  return {
    set:
      <T>(decoder: t.Type<T>) =>
      (key: string, obj: T) => {
        return pipe(
          of(decoder.encode(obj)),
          TEmap(JSON.stringify),
          TEchain((val) => tryCatch(() => client.set(key, val), fromJsError)),
          TEmap(() => obj)
        );
      },
  };
};

const connect = (client: RedisClient): Action<Env, RedisClient> => {
  return pipe(
    tryCatch(() => client.connect(), fromJsError),
    TEmap(() => client),
    fromTaskEither
  );
};

export const createGetRedisApi = (): Action<Env, RedisApi> =>
  pipe(
    asks((env: Env) => createClient({ url: env.redis })),
    chain(connect),
    map(fromClient)
  );
