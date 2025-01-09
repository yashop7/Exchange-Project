"use client";

import { useEffect, useState } from "react";
import {
  getDepth,
  getKlines,
  getTicker,
  getTrades,
} from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { motion } from "framer-motion";

// ShadCN Tabs
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [trade, setTrade] = useState<[string, string][]>();
  const [price, setPrice] = useState<string>();

  let cumulativeBidVolume = 0;
  const bidCumulative = (bids || []).slice(0, 20).map(([price, volume]) => {
    cumulativeBidVolume += parseFloat(volume);
    return cumulativeBidVolume;
  });

  let cumulativeAskVolume = 0;
  const askCumulative = (asks || []).slice(0, 20).map(([price, volume]) => {
    cumulativeAskVolume += parseFloat(volume);
    return cumulativeAskVolume;
  });

  const totalBidVolume = bidCumulative[bidCumulative.length - 1];
  const totalAskVolume = askCumulative[askCumulative.length - 1];
  const totalVolume = totalBidVolume + totalAskVolume;
  const bidPercentage = (totalBidVolume / totalVolume) * 100;
  const askPercentage = (totalAskVolume / totalVolume) * 100;

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        const updateOrderBook = (
          original: [string, string][] | undefined,
          updates: [string, string][],
          isAsk: boolean
        ): [string, string][] => {
          const orderMap = new Map(original || []);
          for (let i = 0; i < updates.length; i++) {
            const [price, size] = updates[i];
            if (size === "0" || parseFloat(size) === 0) {
              orderMap.delete(price);
            } else {
              orderMap.set(price, size);
            }
          }
          return Array.from(orderMap).sort((a, b) =>
            isAsk
              ? parseFloat(a[0]) - parseFloat(b[0])
              : parseFloat(b[0]) - parseFloat(a[0])
          );
        };
        setBids((prev) => updateOrderBook(prev, data.bids, false));
        setAsks((prev) => updateOrderBook(prev, data.asks, true));
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().registerCallback(
      "trade",
      (data: any) => {
        setPrice(data.p);
        setTrade((prev) => {
          const newTrade: [string, string] = [String(data.p), String(data.q)];
          if (prev && prev.length > 0) {
            return [newTrade, ...prev].slice(0, 20);
          }
          return [newTrade];
        });
      },
      `TRADE-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`],
    });
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.bids);
      setAsks(d.asks);
    });
    getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => setPrice(t[0].price));

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
      SignalingManager.getInstance().deRegisterCallback(
        "trade",
        `TRADE-${market}`
      );
    };
  }, []);

  return (
    <Tabs defaultValue="book" className="w-full bg-darkblue  text-white">
      <TabsList>
        <TabsTrigger value="book" className="">Order Book</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>

      {/* <TabsContent value="book bg"> */}
        <div className="flex flex-col h-full">
          <TableHeader />
          <div className="flex flex-col h-[calc(100%-30px)] overflow-hidden overflow-y-scroll no-scrollbar">
            {asks && (
              <AskTable
                asks={[...asks].sort(
                  (a, b) => parseFloat(a[0]) - parseFloat(b[0])
                )}
              />
            )}

            <div
              className={`text-lg ml-1 py-2 tracking-wider ${
                bidPercentage > askPercentage
                  ? "text-[rgba(0,194,120,.9)]"
                  : "text-[rgba(253,75,78,.9)]"
              }`}
            >
              {price && parseFloat(price).toLocaleString()}
            </div>

            {bids && (
              <BidTable
                bids={[...bids].sort(
                  (a, b) => parseFloat(b[0]) - parseFloat(a[0])
                )}
              />
            )}
          </div>
          <div className="p-1">
            <PercentageBar
              bidPercentage={bidPercentage}
              askPercentage={askPercentage}
            />
          </div>
        </div>
      {/* </TabsContent> */}

      <TabsContent value="trades">
        <TradeTableHeader />
        {trade &&
          trade.map(([tradePrice, qty], index) => (
            <div
              key={index}
              className="flex justify-between px-1 py-1 text-sm border-b border-gray-700"
            >
              <span>{parseFloat(tradePrice).toLocaleString()}</span>
              <span>{parseFloat(qty).toLocaleString()}</span>
            </div>
          ))}
      </TabsContent>
    </Tabs>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-lg m-1">
      <div className="text-white pl-1">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500 pr-1">Total</div>
    </div>
  );
}

function TradeTableHeader() {
  return (
    <div className="flex justify-between text-lg m-1">
      <div className="text-white pl-1">Price</div>
      <div className="text-slate-500">Qty</div>
    </div>
  );
}

const PercentageBar = ({
  bidPercentage,
  askPercentage,
}: {
  bidPercentage: number;
  askPercentage: number;
}) => {
  return (
    <div className="w-full">
      <div className="flex h-8 relative">
        <motion.div
          className="bg-greenBackgroundTransparent rounded-l-md flex items-center justify-start px-4 relative"
          style={{
            clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${bidPercentage}%` }}
          transition={{ duration: 1 }}
        >
          <span className="text-[rgba(0,194,120,.9)] text-sm">
            {Math.floor(bidPercentage)}%
          </span>
        </motion.div>
        <motion.div
          className="bg-redBackgroundTransparent rounded-r-md flex items-center justify-end px-4 relative"
          style={{
            clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${askPercentage}%` }}
          transition={{ duration: 1 }}
        >
          <span className="text-[rgba(253,75,78,.9)] text-sm">
            {Math.floor(askPercentage)}%
          </span>
        </motion.div>
      </div>
    </div>
  );
};
