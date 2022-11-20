import bodyParser from "body-parser";
import express from "express";
import { Lazy, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { fromJsError } from "./domain/error";
import { ApiEndpoint } from "./handler/api";
import { createGetEnv } from "./service/env";
import { createGetRedisApi } from "./service/redis";

global.server?.close();

const PORT = 4040;

const trySync = <A>(func: Lazy<A>) =>
  TE.tryCatch(async () => func(), fromJsError);

await pipe(
  TE.Do,
  TE.bind("env", () => createGetEnv("./conf.json")),
  TE.bind("redis", ({ env }) => createGetRedisApi(env)),
  TE.map(({ redis, env }) =>
    express().use(bodyParser.json()).use("/api", ApiEndpoint({ redis, env }))
  ),
  TE.chain((app) =>
    trySync(
      () =>
        (global.server = app.listen(PORT, () =>
          console.log(`listening port: ${PORT}, ${new Date()}`)
        ))
    )
  )
)();
