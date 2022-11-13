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
  createGetEnv("./conf.json"),
  TE.chain(createGetRedisApi()),
  TE.bindTo("redis"),
  TE.bind("app", () => TE.of(express().use(bodyParser.json()))),
  TE.map(({ app, redis }) => app.use("/api", ApiEndpoint(redis))),
  TE.chain((app) =>
    trySync(() => app.listen(PORT, () => console.log(`listening: ${PORT}`)))
  ),
  TE.chain((server) => trySync(() => ((global.server = server), server)))
)();
