import { isLeft, isRight } from "fp-ts/lib/Either";
import { assert, describe, expect, it as test } from "vitest";
import { OrderDecoder } from "../decoder/order";
import { Order, OrderType } from "../domain/order";

const rawOrder = {
  id: null,
  price: 10.0,
  type: OrderType.Buy,
};

describe("order", () => {
  test("decoder works", () => {
    let result = OrderDecoder.decode(rawOrder);
    expect(isRight(result)).toBe(true);
  });
});
