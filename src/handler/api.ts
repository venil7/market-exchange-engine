import express from "express";
import { pipe } from "fp-ts/lib/function";
import TE from "fp-ts/lib/TaskEither";
import {
  decodeOrder,
  decodeOrderId,
  OrderFromStringDecoder,
} from "../decoder/order";
import { Action } from "../domain/action";
import {
  AppContext,
  contextActionHandler,
  HandlerContext,
} from "../domain/handler";
import { Order, withId } from "../domain/order";

const orderGetAction: Action<HandlerContext, Order> = ({
  redis,
  req,
  env,
}: HandlerContext) =>
  pipe(
    req.params["id"],
    decodeOrderId,
    TE.chain((id) =>
      redis.get(OrderFromStringDecoder)(`${env.pair}/order/${id}`)
    )
  );

const orderPushAction: Action<HandlerContext, Order> = ({
  redis,
  req,
  env,
}: HandlerContext) =>
  pipe(
    req.body,
    decodeOrder,
    TE.map(withId),
    TE.chain((order) =>
      redis.enqueue(OrderFromStringDecoder)(`${env.pair}/orders`, order)
    )
  );

const orderPostAction: Action<HandlerContext, Order> = ({
  redis,
  req,
  env,
}: HandlerContext) =>
  pipe(
    req.body,
    decodeOrder,
    TE.map(withId),
    TE.chain((order) =>
      redis.set(OrderFromStringDecoder)(`${env.pair}/order/${order.id}`, order)
    )
  );

const orderGetHandler = contextActionHandler(orderGetAction);
const orderPostHandler = contextActionHandler(orderPostAction);
const orderPushHandler = contextActionHandler(orderPushAction);

export const ApiEndpoint = (appCtx: AppContext) =>
  express()
    .get(`/order/${appCtx.env.pair}/:id`, orderGetHandler(appCtx))
    .post(`/order/${appCtx.env.pair}`, orderPostHandler(appCtx))
    .post(`/orders/${appCtx.env.pair}`, orderPushHandler(appCtx));
