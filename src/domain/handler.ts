import { Handler, NextFunction } from "express";
import { isLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Action } from "./action";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { RedisApi } from "../service/redis";

export type HandlerContext = {
  req: ExpressRequest;
  res: ExpressResponse;
  next?: NextFunction;
  redis: RedisApi;
};

export type HandlerAction<T> = Action<HandlerContext, T>;

export const contextActionHandler =
  <T>(action: HandlerAction<T>) =>
  (redis: RedisApi): Handler => {
    return async (req, res, next) => {
      const task = action({ req, res, next, redis });
      const result = await task();
      if (isLeft(result)) return res.status(500).send(result.left);
      return res.status(200).send(result.right);
    };
  };
