
export const AskTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;
    const relevantAsks = asks.slice(0, 20);
    relevantAsks;
    const asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);
    asksWithTotal;

    return (
        <div className="flex-1 overflow-hidden  overflow-y-scroll no-scrollbar" >
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
}

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
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: `${(70 * total) / maxTotal}%`,
            height: "100%",
            background: "rgba(253, 75, 78, 0.16)",
            transition: "width 0.3s ease-in-out",
          }}
          className="rounded-l-sm"
        ></div>
        <div className="flex justify-between text-xs md:text-base w-full px-1 items-center">
          <div className="flex-1 text-[rgba(253,75,78,.9)] text-start">
            {price}
          </div>
          <div className="flex-1 text-center ">{quantity}</div>
          <div className="flex-1 text-end ">{total.toFixed(2)}</div>
        </div>
      </div>
    );
  }
  