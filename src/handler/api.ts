import express from "express";
import { pipe } from "fp-ts/lib/function";
import TE from "fp-ts/lib/TaskEither";
import { decodeOrder, OrderDecoder } from "../decoder/order";
import { Action } from "../domain/action";
import { contextActionHandler, HandlerContext } from "../domain/handler";
import { Order } from "../domain/order";
import { RedisApi } from "../service/redis";

const helloPostAction: Action<HandlerContext, Order> = (ctx: HandlerContext) =>
  pipe(
    ctx.req.body,
    decodeOrder,
    TE.chain((order) => ctx.redis.set(OrderDecoder)("order", order))
  );

const helloPostHandler = contextActionHandler(helloPostAction);

export const ApiEndpoint = (redis: RedisApi) =>
  express().post("/hello", helloPostHandler(redis));
