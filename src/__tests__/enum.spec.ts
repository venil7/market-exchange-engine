import { isLeft, isRight } from "fp-ts/lib/Either";
import { assert, describe, it as test, chai, expect } from "vitest";
import { Order, OrderType } from "../domain/order";
import { inverse } from "../domain/enum";

describe("enum", () => {
  test("inverse keys/values", () => {
    let result = inverse(OrderType);
    expect(result).toEqual({ buy: "Buy", sell: "Sell" });
  });
});
