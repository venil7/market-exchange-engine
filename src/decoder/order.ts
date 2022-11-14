import * as t from "io-ts";
import { JsonFromString } from "io-ts-types";
import { fromDecoder } from "../domain/action";
import { OrderType } from "../domain/order";

export const OrderDecoder = t.type(
  {
    id: t.union([t.null, t.string], "id"),
    price: t.number,
    type: t.union(
      [t.literal(OrderType.Buy), t.literal(OrderType.Sell)],
      "type"
    ),
  },
  "Order"
);

export const OrderFromStringDecoder = JsonFromString.pipe(OrderDecoder);

export const decodeOrderId = fromDecoder(t.string);
export const decodeOrder = fromDecoder(OrderDecoder);
export const decodeOrderFromString = fromDecoder(OrderFromStringDecoder);
