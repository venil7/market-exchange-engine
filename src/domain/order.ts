import { OrderDecoder } from "../decoder/order";
import * as t from "io-ts";
import { v4 as uuidv4 } from "uuid";

export enum OrderType {
  Buy = "buy",
  Sell = "sell",
}

export type Order = t.TypeOf<typeof OrderDecoder>;

export const withId = (o: Order): Order => ({ ...o, id: uuidv4() });
