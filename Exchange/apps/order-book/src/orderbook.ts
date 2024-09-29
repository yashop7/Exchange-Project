export interface Order {
  price: number;
  quantity: number;
  orderId: string;
}

export interface Bid extends Order {
  side: "bid";
}

export interface Ask extends Order {
  side: "ask";
}

interface Orderbook {
  bids: Bid[]; //Those are Here to buy
  asks: Ask[]; //Those are Here to sell
}

export const orderbook: Orderbook = {
  // Initializing the constant
  bids: [],
  asks: [],
};

export const bookWithQuantity: {
  bids: { [price: number]: number };
  asks: { [price: number]: number };
} = {
  bids: {},
  asks: {},
};
