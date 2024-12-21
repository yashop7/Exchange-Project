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

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [price, setPrice] = useState<string>();

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {

        //Data is in the form of this
        // {
        //     "bids": [
        //       ["50000", "2.5"], // Updated size for 50000
        //       ["49000", "2.0"], // Unchanged
        //       ["47000", "1.0"]  // New price level
        //     ],
        //     "asks": [
        //       ["51000", "1.5"], // Price: 51000, Size: 1.5
        //       ["52000", "2.0"], // Price: 52000, Size: 2.0
        //       ["53000", "3.0"]  // Price: 53000, Size: 3.0
        //     ]
        //   }

        // Create efficient update function
        const updateOrderBook = (
          original: [string, string][] | undefined,
          updates: [string, string][],
          isAsk: boolean
        ): [string, string][] => {
          // Create initial map with existing orders
          const orderMap = new Map(original || []);

          // Update map with new data
          for (let i = 0; i < updates.length; i++) {
            const [price, size] = updates[i];
            if (size === "0" || parseFloat(size) === 0) {
              orderMap.delete(price);
            } else {
              orderMap.set(price, size);
            }
          }

          // Convert to array and sort in one pass
          return Array.from(orderMap).sort((a, b) =>
            isAsk
              ? parseFloat(a[0]) - parseFloat(b[0])
              : parseFloat(b[0]) - parseFloat(a[0])
          );
        };
        // Update bids
        setBids((prev) => updateOrderBook(prev, data.bids, false));

        // Update asks
        setAsks((prev) => updateOrderBook(prev, data.asks, true));
      },
      `DEPTH-${market}`
    );

    //We are Subscribing that we want the data of the market Now
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.bids);
      console.log("d.bids.reverse(): ", d.bids.reverse());
      setAsks(d.asks);
      console.log("d.asks: ", d.asks);
    });
    getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => setPrice(t[0].price));
    // getKlines(market, "1h", 1640099200, 1640100800).then(t => setPrice(t[0].close));
    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
    };
  }, []);

  return (
    <div className="flex flex-col h-full text-white">
      <TableHeader />
      <div className="flex flex-col h-[calc(100%-30px)] overflow-hidden overflow-y-scroll no-scrollbar">
        {asks && <AskTable asks={asks} />}

        <div className="text-xl py-2">{price}</div>

        {bids && <BidTable bids={bids} />}
      </div>
      <div className="px-2 py-2">
        <PercentageBar bids={bids || []} asks={asks || []} />
      </div>
    </div>
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

const PercentageBar = ({
  bids,
  asks,
}: {
  bids: [string, string][];
  asks: [string, string][];
}) => {


  let cumulativeBidVolume = 0;
  const bidCumulative = bids.slice(0,20).map(([price, volume]) => {
    cumulativeBidVolume += parseFloat(volume);
    return cumulativeBidVolume; // Return cumulative volume at this level
  });

  let cumulativeAskVolume = 0;
  const askCumulative = asks.slice(0,20).map(([price, volume]) => {
    cumulativeAskVolume += parseFloat(volume);
    return cumulativeAskVolume; // Return cumulative volume at this level
  });

  // Step 2: Get the highest cumulative volumes
  const totalBidVolume = bidCumulative[bidCumulative.length - 1]; // Last cumulative bid volume
  const totalAskVolume = askCumulative[askCumulative.length - 1]; // Last cumulative ask volume
  const totalVolume = totalBidVolume + totalAskVolume;

  // Step 3: Calculate percentages
  const bidPercentage = (totalBidVolume / totalVolume) * 100;
  const askPercentage = (totalAskVolume / totalVolume) * 100;



  return (
    <div className="w-full">
      <div className="flex h-8 relative">
        {/* Bid side with angled edge */}
        <div
          className="bg-greenBackgroundTransparent  rounded-md flex items-center justify-start px-4 relative"
          style={{
            width: `${bidPercentage}%`,
            clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
          }}
        >
          <span className="text-[rgba(0,194,120,.9)] text-sm">
            {Math.floor(bidPercentage)}%
          </span>
        </div>

        {/* Ask side with angled edge */}
        <div
          className="bg-redBackgroundTransparent rounded-md  flex items-center justify-end px-4 relative"
          style={{
            width: `${askPercentage}%`,
            clipPath: "polygon(10px 0, 100% 0, 100% 100%, 0 100%)",
          }}
        >
          <span className="text-[rgba(253,75,78,.9)] text-sm">
            {Math.floor(askPercentage)}%
          </span>
        </div>
      </div>

      {/* Market dominance indicator */}
    </div>
  );
};
