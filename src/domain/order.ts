import { OrderDecoder } from "../decoder/order";
import * as t from "io-ts";

export enum OrderType {
  Buy = "buy",
  Sell = "sell",
}

export type Order = t.TypeOf<typeof OrderDecoder>;
