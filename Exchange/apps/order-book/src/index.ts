import express from "express";
import { OrderInputSchema } from "./types";
import { orderbook, bookWithQuantity } from "./orderbook";

// export const OrderInputSchema = z.object({
//     baseAsset: z.string(),
//     quoteAsset: z.string(),
//     price: z.number(),
//     quantity: z.number(),
//     side: z.enum(['buy', 'sell']),
//     type: z.enum(['limit', 'market']),
//     kind: z.enum(['ioc']).optional(),
//   });

// export const bookWithQuantity: {
//   bids: { [price: number]: number };
//   asks: { [price: number]: number };
// } = {
//   bids: {},
//   asks: {},
// };

// export const orderbook: Orderbook = {
//   bids: [],
//   asks: [],
// };

const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";
const app = express();
app.use(express.json());

let GLOBAL_TRADE_ID = 0;

app.post("/api/v1/order", (req, res) => {
  const order = OrderInputSchema.safeParse(req.body);
  if (!order.success) {
    res.status(400).send(order.error.message);
    return;
  }

  const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;

  if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
    //Added Check for the Base and the Quote Asset
    res.status(400).send("Invalid asset pair");
    return;
  }
  const orderId = getOrderId();
  const { executedQty, fills } = fillOrder(
    orderId,
    price,
    quantity,
    side,
    kind
  );

  res.send({
    orderId,
    executedQty,
    fills,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

function getOrderId(): string {
  //Generated a Random String which is truly Random in Nature
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
interface Fill {
  price: number;
  qty: number;
  tradeId: number;
}
function fillOrder(
  orderId: string,
  price: number,
  quantity: number,
  side: "buy" | "sell",
  type?: "ioc"
): { status: "rejected" | "accepted"; executedQty: number; fills: Fill[] } {
  const fills: Fill[] = [];
  let executedQty = 0;
  
  const maxFillQuantity = getFillAmount(price, quantity, side); //This will get us the Quantity How much Quantity is present in this Price from the Other Side

  if (type === "ioc" && maxFillQuantity < quantity) {
    return { status: "rejected", executedQty: maxFillQuantity, fills: [] };
  }

  if (side === "buy") {
    // asks should be sorted before you try to fill them
    orderbook.asks.forEach((o) => {
      if (o.price < price && quantity > 0) {
        const filledQuantity = Math.min(quantity, o.quantity);
        o.quantity -= filledQuantity;
        //Also Updating the bookWithQuantity // we removed the Quantity from it
        bookWithQuantity.asks[o.price] =
          (bookWithQuantity.asks[o.price] || 0) - filledQuantity;
        //One Entry in the Fills Array from a Particular order
        fills.push({
          price: o.price,
          qty: filledQuantity,
          tradeId: GLOBAL_TRADE_ID++,
        });
        executedQty += filledQuantity;
        quantity -= filledQuantity;

        //removing the Order from the OrderBook and the Records
        //First I have Used Splice which is Slow We will use this But with Different Approach
        if (o.quantity === 0) {
          orderbook.asks.splice(orderbook.asks.indexOf(o), 1); //This is Kind of Smart Removing from the Particular Array
        }
        if (bookWithQuantity.asks[price] === 0) {
          //If Quantity is Zero, then we will remove that Point from the OrderBook Object
          
          console.log("---------------------------------------------");
          console.log("bookWithQuantity.asks[price]: ", bookWithQuantity.asks[price]);
          console.log("bookWithQuantity.asks: ", bookWithQuantity.asks);
          delete bookWithQuantity.asks[price];
          console.log("bookWithQuantity.asks: ", bookWithQuantity.asks);
          console.log("---------------------------------------------");
        }
      }
    });
    // If our quantity is Still not Fulfilled then in That case we will push it into the the Orderbook bids table
    if (quantity !== 0) {
      orderbook.bids.push({
        price,
        quantity: quantity,
        side: "bid",
        orderId,
      });
      //If we are Unable tio complete the quantity we have made a newEntry in the bookWithQuantity.bids ENTRY
      bookWithQuantity.bids[price] =
        (bookWithQuantity.bids[price] || 0) + quantity; //Changing the Quantity
    }
  } else {
    orderbook.bids.forEach((o) => {
      if (o.price < price && quantity > 0) {
        const filledQuantity = Math.min(quantity, o.quantity);
        o.quantity -= filledQuantity;
        bookWithQuantity.bids[o.price] =
          (bookWithQuantity.bids[o.price] || 0) - filledQuantity;
        fills.push({
          price: o.price,
          qty: filledQuantity,
          tradeId: GLOBAL_TRADE_ID++,
        });
        executedQty += filledQuantity;
        quantity -= filledQuantity;

        if (o.quantity === 0) {
          orderbook.bids.splice(orderbook.bids.indexOf(o), 1);
        }
        if (bookWithQuantity.bids[o.price] === 0) {
          delete bookWithQuantity.bids[o.price];
        }
      }
    });
    //Now we will Push this into the Asks Table
    if (quantity !== 0) {
      orderbook.asks.push({
        price,
        quantity: quantity,
        side: "ask",
        orderId,
      });
    }
    bookWithQuantity.asks[price] =
      (bookWithQuantity.asks[price] || 0) + quantity; //Changing the Quantity
  }

  console.log("orderbook: ", orderbook);
  console.log("bookWithQuantity: ", bookWithQuantity);
  

  return {
    status: "accepted",
    executedQty,
    fills,
  };
}

function getFillAmount(
  price: number,
  quantity: number,
  side: "buy" | "sell"
): number {
  let filled = 0;

  if (side == "buy") {
    orderbook.asks.forEach((o) => {
      if (o.price < price) {
        //Buyer will Ask for the prices which are Ready to Sell below he wants to Pay
        filled += Math.min(quantity, o.quantity);
      }
    });
  } else {
    orderbook.bids.forEach((o) => {
      if (o.price > price) {
        // Seller will ask for person who can Spend more
        filled += Math.min(quantity, o.quantity);
      }
    });
  }
  return filled;
}
