
export const BidTable = ({ bids }: {bids: [string, string][]}) => {
    let currentTotal = 0; 
    const relevantBids = bids.slice(0, 20);
    const bidsWithTotal: [string, string, number][] = relevantBids.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantBids.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

    return (
        <div className="flex-1 overflow-hidden  overflow-y-scroll no-scrollbar">
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
          className="mb-[2px] h-7 "
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: `${(70 * total) / maxTotal}%`,
              height: "100%",
              transition: "width 0.3s ease-in-out",
            }}
            className="rounded-l-sm bg-greenBackgroundTransparent  "
          ></div>
          <div
            className={`flex justify-between text-xs md:text-base w-full px-1 z-10 items-center`}
          >
            <div className="flex-1 text-start text-[rgba(0,194,120,.9)]">{price}</div>
            <div className="flex-1 text-center ">{quantity}</div>
            <div className="flex-1 text-end ">{total.toFixed(2)}</div>
          </div>
        </div>
      );
    }
    