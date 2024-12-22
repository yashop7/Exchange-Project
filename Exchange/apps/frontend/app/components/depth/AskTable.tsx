import { useEffect, useRef, useState } from 'react';
import { formatNumber } from './BidTable';

export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 20);
  const asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
  const maxTotal = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setIsFirstRender(false);
    }
  }, [isFirstRender, asksWithTotal]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden overflow-y-scroll no-scrollbar">
      <div className="flex flex-col-reverse no-scrollbar">
        {asksWithTotal?.map(([price, quantity, total]) => (
          <Ask
            maxTotal={maxTotal}
            key={price}
            price={price}
            quantity={quantity}
            total={total}
          />
        ))}
      </div>
    </div>
  );
};

function Ask({
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
          background: "rgba(253, 75, 78, 0.07)", // Light red for cumulative size
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
          background: "rgb(121, 44, 49)",
          transition: "width 0.3s ease-in-out",
        }}
        className="rounded-l-sm"
      ></div>

      <div className="flex justify-between text-xs md:text-base w-full px-1 items-center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex-1 tracking-widest text-sm text-[rgba(253,75,78,.9)] text-start">
        {price && parseFloat(price).toLocaleString()}
        </div>
        <div className="flex-1 tracking-widest text-sm text-center">{formatNumber(quantity)}</div>
        <div className="flex-1 tracking-widest text-sm text-end mr-1 text-white">{formatNumber(total.toFixed(2))}</div>
      </div>
    </div>
  );
}
