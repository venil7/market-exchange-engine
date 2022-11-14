import express from "express";
import { pipe } from "fp-ts/lib/function";
import TE from "fp-ts/lib/TaskEither";
import {
  decodeOrder,
  decodeOrderId,
  OrderFromStringDecoder,
} from "../decoder/order";
import { Action } from "../domain/action";
import { contextActionHandler, HandlerContext } from "../domain/handler";
import { Order, withId } from "../domain/order";
import { RedisApi } from "../service/redis";

const orderGetAction: Action<HandlerContext, Order> = (ctx: HandlerContext) =>
  pipe(
    ctx.req.params["id"],
    decodeOrderId,
    TE.chain((id) => ctx.redis.get(OrderFromStringDecoder)(`order/${id}`))
  );

const orderPostAction: Action<HandlerContext, Order> = (ctx: HandlerContext) =>
  pipe(
    ctx.req.body,
    decodeOrder,
    TE.map(withId),
    TE.chain((order) =>
      ctx.redis.set(OrderFromStringDecoder)(`order/${order.id}`, order)
    )
  );

const orderGetHandler = contextActionHandler(orderGetAction);
const orderPostHandler = contextActionHandler(orderPostAction);

export const ApiEndpoint = (redis: RedisApi) =>
  express()
    .get("/order/:id", orderGetHandler(redis))
    .post("/order", orderPostHandler(redis));
