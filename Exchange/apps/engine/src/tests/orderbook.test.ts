import { describe, expect, it } from "vitest";
import { Orderbook } from "../trade/OrderBook";
import exp from "constants";

describe("Simple orders", () => {
  it("Empty orderbook should not be filled", () => {
    const orderbook = new Orderbook("TATA", [], [], 0, 0);
    const order = {
      price: 1000,
      quantity: 1,
      orderId: "1",
      filled: 0,
      side: "buy" as "buy" | "sell",
      userId: "1",
    };
    const { fills, executedQty } = orderbook.addOrder(order);
    expect(fills.length).toBe(0);
    expect(executedQty).toBe(0);
  });

  it("buy 5 times and then Sell doesn't change the orderbook", () => {
    const orderbook = new Orderbook("TATA", [], [], 0, 0);
    for (let i = 0; i < 5; i++) {
      const order = {
        price: 1000,
        quantity: 1,
        orderId: "1",
        filled: 0,
        side: "buy" as "buy" | "sell",
        userId: "1",
      };
      orderbook.addOrder(order);
    }
    const order = {
      price: 1000,
      quantity: 1,
      orderId: "1",
      filled: 0,
      side: "sell" as "buy" | "sell",
      userId: "1",
    };
    const { fills, executedQty } = orderbook.addOrder(order);

    expect(fills.length).toBe(1);
    expect(executedQty).toBe(1);
    expect(orderbook.getDepth().bids.length).toBe(1);
    expect(orderbook.getDepth().asks.length).toBe(0);
    expect(orderbook.getDepth().bids.find(x => x[0] === "1000")?.[1]).toBe("4");
  });

  it("Can be partially filled", () => {
    const orderbook = new Orderbook(
      "TATA",
      [
        {
          price: 1000,
          quantity: 1,
          orderId: "1",
          filled: 0,
          side: "buy" as "buy" | "sell",
          userId: "1",
        },
      ],
      [],
      0,
      0
    );

    const order = {
      price: 1000,
      quantity: 2,
      orderId: "2",
      filled: 0,
      side: "sell" as "buy" | "sell",
      userId: "2",
    };

    const { fills, executedQty } = orderbook.addOrder(order);
    expect(fills.length).toBe(1);
    expect(executedQty).toBe(1);
  });

  it("Can be partially filled", () => {
    const orderbook = new Orderbook(
      "TATA",
      [
        {
          price: 999,
          quantity: 1,
          orderId: "1",
          filled: 0,
          side: "buy" as "buy" | "sell",
          userId: "1",
        },
      ],
      [
        {
          price: 1001,
          quantity: 1,
          orderId: "2",
          filled: 0,
          side: "sell" as "buy" | "sell",
          userId: "2",
        },
      ],
      0,
      0
    );

    const order = {
      price: 1001,
      quantity: 2,
      orderId: "3",
      filled: 0,
      side: "buy" as "buy" | "sell",
      userId: "3",
    };

    const { fills, executedQty } = orderbook.addOrder(order);
    expect(fills.length).toBe(1);
    expect(executedQty).toBe(1);
    expect(orderbook.bids.length).toBe(2);
    expect(orderbook.asks.length).toBe(0);
  });
});

describe("Self trade prevention", () => {
  it.todo("User cant self trade", () => {
    const orderbook = new Orderbook(
      "TATA",
      [
        {
          price: 999,
          quantity: 1,
          orderId: "1",
          filled: 0,
          side: "buy" as "buy" | "sell",
          userId: "1",
        },
      ],
      [
        {
          price: 1001,
          quantity: 1,
          orderId: "2",
          filled: 0,
          side: "sell" as "buy" | "sell",
          userId: "2",
        },
      ],
      0,
      0
    );

    const order = {
      price: 999,
      quantity: 2,
      orderId: "3",
      filled: 0,
      side: "sell" as "buy" | "sell",
      userId: "3",
    };

    const { fills, executedQty } = orderbook.addOrder(order);
    expect(fills.length).toBe(0);
    expect(executedQty).toBe(0);
  });
});

describe("Precission errors are taken care of", () => {
  // This does succeed right now as well, but can be flaky based on how long the decimals are
  it.todo("Bid doesnt persist even with decimals", () => {
    const orderbook = new Orderbook(
      "TATA",
      [
        {
          price: 999,
          quantity: 0.551123,
          orderId: "1",
          filled: 0,
          side: "buy" as "buy" | "sell",
          userId: "1",
        },
      ],
      [
        {
          price: 1001,
          quantity: 0.551,
          orderId: "2",
          filled: 0,
          side: "sell" as "buy" | "sell",
          userId: "2",
        },
      ],
      0,
      0
    );

    const order = {
      price: 999,
      quantity: 0.551123,
      orderId: "3",
      filled: 0,
      side: "sell" as "buy" | "sell",
      userId: "3",
    };

    const { fills, executedQty } = orderbook.addOrder(order);
    expect(fills.length).toBe(1);
    expect(orderbook.bids.length).toBe(0);
    expect(orderbook.asks.length).toBe(1);
  });
});
