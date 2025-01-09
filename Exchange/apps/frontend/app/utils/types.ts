export interface KLine {
  close: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  end: string;
  start: string;
  trades: string;
  volume: string;
}

export interface Trade {
  id: number;
  isBuyerMaker: boolean;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
}

export interface Depth {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: string;
}

export interface Ticker {
  firstPrice: string;
  high: string;
  lastPrice: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  trades: string;
  volume: string;
}

export interface OrderFillResponse {
  orderId: string;
  executedQty: number;
  fills: [
    {
      price: string;
      qty: number;
      tradeId: number;
    }
  ];
}
