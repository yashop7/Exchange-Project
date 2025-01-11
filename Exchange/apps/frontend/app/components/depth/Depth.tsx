"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  getDepth,
  getKlines,
  getTicker,
  getTrades,
} from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
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
  const [price, setPrice] = useState<string>("1000");
  // Dummy trade data: [price, quantity]
  const dummyTradeData: [string, string][] = [
    ["5000", "0.12"],
    ["4999", "0.05"],
    ["5000", "0.08"],
    ["4999", "0.15"],
    ["5000", "0.03"],
    ["5000", "0.12"],
    ["4999", "0.05"],
    ["5000", "0.08"],
    ["4999", "0.15"],
    ["5000", "0.03"],
    ["5000", "0.12"],
    ["4999", "0.05"],
    ["5000", "0.08"],
    ["4999", "0.15"],
    ["5000", "0.03"],
  ];

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
  const bidPercentage = (totalBidVolume / totalVolume) * 100 || 0;
  const askPercentage = (totalAskVolume / totalVolume) * 100 || 0;

  useEffect(() => {
    const instance = SignalingManager.getInstance();
    instance.registerCallback(
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

    instance.registerCallback(
      "trade",
      (data: any) => {
        setPrice(data.price);
        setTrade((prev) => {
          const newTrade: [string, string] = [
            String(data.price),
            String(data.quantity),
          ];
          if (prev && prev.length > 0) {
            return [newTrade, ...prev];
          }
          return [newTrade];
        });
      },
      `TRADE-${market}`
    );

    instance.sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`],
    });
    instance.sendMessage({
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
      instance.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      instance.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      instance.deRegisterCallback("depth", `DEPTH-${market}`);
      instance.deRegisterCallback("trade", `TRADE-${market}`);
    };
  }, [market]);

  return (
    <Tabs defaultValue="book" className="w-full bg-transparent overflow-hidden no-scrollbar text-white">
      <TabsList>
        <TabsTrigger value="book">Order Book</TabsTrigger>
        <TabsTrigger value="trades">Trades</TabsTrigger>
      </TabsList>

      {/* Order Book Tab */}
      <TabsContent value="book" className="p-2">
        <div className="flex flex-col h-full">
          <TableHeader />
          <div className="flex flex-col h-[calc(100%-30px)] overflow-y-scroll no-scrollbar">
            {asks && (
              <AskTable
                asks={[...asks].sort(
                  (a, b) => parseFloat(a[0]) - parseFloat(b[0])
                )}
              />
            )}

            <div
              className={`text-lg py-2 tracking-wider ${
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
      </TabsContent>

      <TabsContent value="trades" className="p-2 ">
        <table className="w-full table-auto ">
          <thead>
        <tr>
          <th className="text-left">Price</th>
          <th className="text-left">Qty</th>
        </tr>
          </thead>
          <tbody className="">
        <AnimatePresence initial={false}>
          {trade && trade.reverse().map(([tradePrice, qty], index, array) => (
            <motion.tr
          key={index}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="border-b border-gray-700 overflow-hidden no-scrollbar"
            >
          <td className="p-2">
            {parseFloat(tradePrice) >
            parseFloat(array[index + 1]?.[0] ?? tradePrice) ? (
              <ArrowUp
            className="inline-block text-[rgba(0,194,120,.9)] mr-1"
            size={16}
              />
            ) : (
              <ArrowDown
            className="inline-block text-[rgba(253,75,78,.9)] mr-1"
            size={16}
              />
            )}
            {parseFloat(tradePrice) >
            parseFloat(array[index + 1]?.[0] ?? tradePrice) ? (
              <span className="text-[rgba(0,194,120,.9)]">
            ${parseFloat(tradePrice).toFixed(2)}
              </span>
            ) : (
              <span className="text-[rgba(253,75,78,.9)]">
            ${parseFloat(tradePrice).toFixed(2)}
              </span>
            )}
          </td>
          <td className="p-2 text-slate-400 font-mono">
            {parseFloat(qty).toFixed(3)}
          </td>
            </motion.tr>
          ))}
        </AnimatePresence>
          </tbody>
        </table>
      </TabsContent>
    </Tabs>
  )};

function TableHeader() {
  return (
    <div className="flex justify-between    text-lg m-1">
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
          className="bg-greenBackgroundTransparent rounded-l-md flex items-center justify-start px-4"
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
          className="bg-redBackgroundTransparent rounded-r-md flex items-center justify-end px-4"
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
