"use client";
import { useEffect, useState } from "react";
import { Ticker } from "../utils/types";
import { getAllInfo, getTicker } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";
import { ChevronDown } from "lucide-react";
import Image from 'next/image';

export const MarketBar = ({ market }: { market: string }) => {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [tokenImage, settokenImage] = useState<string | null>(null);
  useEffect(() => {
    //fetch the Image from getAllInfo
    async function fetchImage() {
      const data = await getAllInfo();
      const image = data.find((d: any) => d.symbol.toLowerCase() === market.split("_")[0].toLowerCase())?.image;
      settokenImage(image);
    }
    fetchImage();
  }, []);
  useEffect(() => {
    getTicker(market).then(setTicker);
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: Partial<Ticker>) =>
        setTicker((prevTicker) => ({
          firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? "",
          high: data?.high ?? prevTicker?.high ?? "",
          lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? "",
          low: data?.low ?? prevTicker?.low ?? "",
          priceChange: data?.priceChange ?? prevTicker?.priceChange ?? "",
          priceChangePercent:
            data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? "",
          quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? "",
          symbol: data?.symbol ?? prevTicker?.symbol ?? "",
          trades: data?.trades ?? prevTicker?.trades ?? "",
          volume: data?.volume ?? prevTicker?.volume ?? "",
        })),
      `TICKER-${market}`
    );
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`],
    });

    return () => {
      //Whenver the Market Changes or Re-render is Done
      //or the Component UnMounts,
      // then This logic is Run after that the Above logic is Run
      SignalingManager.getInstance().deRegisterCallback(
        "ticker",
        `TICKER-${market}`
      );
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`],
      });
    };
  }, [market]);
  //
  const formatNumber = (num: string | undefined) => {
    const number = parseFloat(num ?? "0");
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: "decimal",
    });
  };

  return (
    <div>
      <div className="flex items-center flex-row relative w-full overflow-hidden border-b text-white border-neutral-800 p-1">
        <div className="flex items-center justify-between flex-row no-scrollbar overflow-auto pr-4">
          <TickerButton market={market} tokenImage={tokenImage} />
          <div className="flex items-center flex-row space-x-8 pl-4">
            <div className="flex flex-col h-full justify-center">
              <p
                className={`font-medium tabular-nums text-greenText text-2xl text-green-500`}
              >
                {formatNumber(ticker?.lastPrice)}
              </p>
              <p className="font-medium tabular-nums pl-2">
                ${formatNumber(ticker?.lastPrice)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className={`font-medium text-xs text-slate-400 md:text-base `}>
                24H Change
              </p>
              <p
                className={` text-xs font-medium tabular-nums leading-5 md:text-base  text-greenText ${
                  Number(ticker?.priceChange) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Number(ticker?.priceChange) > 0 ? "+" : ""}{" "}
                {formatNumber(ticker?.priceChange)}{" "}
                {Number(ticker?.priceChangePercent)?.toFixed(2)}%
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-xs text-slate-400 md:text-base ">
                24H High
              </p>
              <p className=" text-xs font-medium tabular-nums leading-5 md:text-lg ">
                {formatNumber(ticker?.high)}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-xs text-slate-400 md:text-base ">
                24H Low
              </p>
              <p className=" text-xs font-medium tabular-nums leading-5 md:text-lg ">
                {formatNumber(ticker?.low)}
              </p>
            </div>
            <button
              type="button"
              className="font-medium transition-opacity hover:opacity-80 hover:cursor-pointer text-base text-left"
              data-rac=""
            >
              <div className="flex flex-col">
                <p className="font-medium text-xs text-slate-400 md:text-base ">
                  24H Volume
                </p>
                <p className=" text-xs font-medium tabular-nums leading-5 md:text-lg ">
                  {formatNumber(ticker?.volume)}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function TickerButton({ market, tokenImage }: { market: string, tokenImage: string | null }) {
  return (

    <div className="flex h-[60px] shrink-0 space-x-4 rounded-full m-1 bg-blue-200 bg-opacity-10  ">
      <div className="flex flex-row relative ml-2 -mr-4">
        <img
          alt="Market Logo"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          className="z-10 rounded-full h-6 w-6 mt-4 outline-baseBackgroundL1"
          src={market === "TATA_INR" ? "/TATA.png" : tokenImage || "/sol copy.webp"}
        />
        <img
          alt="USDC Logo"
          loading="lazy"
          decoding="async"
          data-nimg="1"
          className="h-6 w-6 -ml-2 mt-4 rounded-full"
          src="/usdc copy.webp"
        />
      </div>
      <button type="button" className="react-aria-Button" data-rac="">
        <div className="flex items-center justify-between flex-row cursor-pointer rounded-full px-3 py-1 hover:opacity-80">
          <div className="flex items-center flex-row gap-2 undefined">
            <div className="flex items-center flex-row relative">
              <p className="font-medium text-xl undefined">
                {market.replace("_", " / ")}
              </p>
              <span className="ml-1">
                <ChevronDown className="text-violet-200/30 " />
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
