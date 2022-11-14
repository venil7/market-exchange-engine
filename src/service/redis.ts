import { pipe } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { createClient } from "redis";
import { Action, ActionResult, fromDecoder } from "../domain/action";
import { Env } from "../domain/env";
import { fromJsError, genericError } from "../domain/error";

type RedisClient = ReturnType<typeof createClient>;
export type RedisApi = {
  set: <T extends {}>(
    decoder: t.Type<T, string, string>
  ) => (key: string, obj: T) => ActionResult<T>;
  get: <T extends {}>(
    decoder: t.Type<T, string, string>
  ) => (key: string) => ActionResult<T>;
};

const fromClient = (client: RedisClient): RedisApi => {
  return {
    set:
      <T extends {}>(decoder: t.Type<T, string, string>) =>
      (key: string, obj: T) => {
        return pipe(
          TE.of(decoder.encode(obj)),
          TE.chain((val) =>
            TE.tryCatch(() => client.set(key, val), fromJsError)
          ),
          TE.map(() => obj)
        );
      },

    get:
      <T extends {}>(decoder: t.Type<T, string, string>) =>
      (key: string) => {
        return pipe(
          TE.tryCatch(() => client.get(key), fromJsError),
          TE.chain(TE.fromNullable(genericError(`Record not found`))),
          TE.chain(fromDecoder(decoder))
        );
      },
  };
};

const connect = (client: RedisClient): Action<Env, RedisClient> => {
  return pipe(
    TE.tryCatch(() => client.connect(), fromJsError),
    TE.map(() => client),
    RTE.fromTaskEither
  );
};

export const createGetRedisApi = (): Action<Env, RedisApi> =>
  pipe(
    RTE.asks((env: Env) => createClient({ url: env.redis })),
    RTE.chain(connect),
    RTE.map(fromClient)
  );
