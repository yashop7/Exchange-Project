import { useEffect, useRef, useState } from 'react';

export const BidTable = ({ bids }: { bids: [string, string][] }) => {
  let currentTotal = 0;
  const relevantBids = bids.slice(0, 20);
  const bidsWithTotal: [string, string, number][] = relevantBids.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
  const maxTotal = relevantBids.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden overflow-y-scroll no-scrollbar">
      <div className="">
        {bidsWithTotal?.map(([price, quantity, total]) => (
          <Bid
            maxTotal={maxTotal}
            total={total}
            key={price}
            price={price}
            quantity={quantity}
          />
        ))}
      </div>
    </div>
  );
};

function Bid({
  price,
  quantity,
  total,
  maxTotal,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
      className="mb-[2px] h-7"
    >
      {/* Dark Bar: Represents cumulative size */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${(60 * total) / maxTotal}%`,
          height: "100%",
          background: "rgba(0, 194, 120, 0.16)", // Light green for cumulative size
          transition: "width 0.3s ease-in-out",
        }}
        className="rounded-l-sm"
      ></div>

      {/* Light Bar: Represents individual size */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${(70 * Number(quantity)) / maxTotal}%`,
          height: "100%",
          background: "rgb(28, 96, 69)", // Slightly lighter green for individual size
          transition: "width 0.3s ease-in-out",
        }}
        className="rounded-l-sm"
      ></div>

      <div className="flex justify-between text-xs md:text-base w-full px-1 z-10 items-center">
        <div className="flex-1 tracking-widest text-sm text-start text-[rgba(0,194,120,.9)]">
        {price && parseFloat(price).toLocaleString()}
        </div>
        <div className="flex-1 tracking-widest text-sm text-center ">{formatNumber(quantity)}</div>
        <div className="flex-1 tracking-widest text-sm mr-1 text-end ">{formatNumber(total)}</div>
      </div>
    </div>
  );
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  } else {
    return num.toFixed(4);
  }
}