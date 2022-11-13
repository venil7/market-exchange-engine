import * as t from "io-ts";
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

export const decodeOrder = fromDecoder(OrderDecoder);
