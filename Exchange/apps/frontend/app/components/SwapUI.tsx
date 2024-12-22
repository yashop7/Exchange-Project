"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export function SwapUI({ market }: { market: string }) {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("limit");

  return (
    <div>
      <div className="flex flex-col text-white">
        <div className="flex flex-row h-[76px]">
          <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
          <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-3">
            <div className="flex flex-row flex-0 gap-5 undefined">
              <LimitButton type={type} setType={setType} />
              <MarketButton type={type} setType={setType} />
            </div>
          </div>
          <div className="flex flex-col px-3">
            <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-row">
                  <p className="text-base  text-slate-400 font-normal ">
                    Available Balance
                  </p>
                  <p className="font-medium text-base text-baseTextHighEmphasis ">
                    36.94 USDC
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm md:text-base font-normal  text-slate-400">
                  Price
                </p>
                <div className="flex flex-col relative mb-2">
                  <input
                    step="0.01"
                    placeholder="0"
                    className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                    type="text"
                    value="134.38"
                  />
                  <div className="flex flex-row absolute right-1 top-1 p-2">
                    <div className="relative">
                      <img src="/usdc.webp" className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm md:text-base font-normal  text-slate-400">
                Quantity
              </p>
              <div className="flex flex-col relative">
                <input
                  step="0.01"
                  placeholder="0"
                  className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                  type="text"
                  value="123"
                />
                <div className="flex flex-row absolute right-1 top-1 p-2">
                  <div className="relative">
                    <img src="/sol.webp" className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end flex-row">
                <p className="font-medium pr-2 text-md text-baseTextMedEmphasis">
                  ≈ 0.00 USDC
                </p>
              </div>
              <div className="flex justify-between  flex-row mt-2 gap-3">
                <div className="flex items-center justify-center flex-row rounded-full px-[22px] py-[8px] text-xs md:text-sm hover:bg-white/15 cursor-pointer bg-baseBackgroundL2">
                  25%
                </div>
                <div className="flex items-center justify-center flex-row rounded-full px-[22px] py-[8px] text-xs md:text-sm hover:bg-white/15 cursor-pointer bg-baseBackgroundL2">
                  50%
                </div>
                <div className="flex items-center justify-center flex-row rounded-full px-[22px] py-[8px] text-xs md:text-sm hover:bg-white/15 cursor-pointer bg-baseBackgroundL2">
                  75%
                </div>
                <div className="flex items-center justify-center flex-row rounded-full px-[22px] py-[8px] text-xs md:text-sm hover:bg-white/15 cursor-pointer bg-baseBackgroundL2">
                  Max
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`font-semibold focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-xl px-4 py-3 my-4 ${
                activeTab === "sell"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#00c177] hover:bg-[#00c177]/80"
              } text-gray-900 cursor-pointer active:scale-98`}
              data-rac=""
            >
              {activeTab === "sell" ? "Sell" : "Buy"}
            </button>

            <div className="flex justify-between flex-row mt-3 mb-1">
              <div className="flex flex-row gap-4">
                <div className="flex items-center group cursor-pointer">
                  <Checkbox
                    id="postOnly"
                    className="form-checkbox rounded border-2 border-solid border-baseBorderMed 
                                             bg-black text-white shadow-none outline-none ring-0 
                                              checked:bg-black checked:text-white
                                             focus:ring-0 
                                             cursor-pointer h-5 w-5 transition-colors duration-200"
                  />
                  <label
                    htmlFor="postOnly"
                    className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 cursor-pointer select-none"
                  >
                    Post Only
                  </label>
                </div>
                <div className="flex items-center group cursor-pointer">
                  <Checkbox
                    id="ioc"
                    className="form-checkbox rounded border-2 border-solid border-baseBorderMed 
                                             bg-black text-white shadow-none outline-none ring-0 
                                              checked:bg-black checked:text-white
                                             focus:ring-0 
                                             cursor-pointer h-5 w-5 transition-colors duration-200"
                  />
                  <label
                    htmlFor="ioc"
                    className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 cursor-pointer select-none"
                  >
                    IOC
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("limit")}
    >
      <div
        className={`text-base  font-medium py-1 border-b-2 ${type === "limit" ? "border-accentBlue text-white" : "border-transparent text-slate-400 hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}
      >
        Limit
      </div>
    </div>
  );
}

function MarketButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("market")}
    >
      <div
        className={`text-base  font-medium py-1 border-b-2 ${type === "market" ? "border-accentBlue text-white" : "border-b-2 border-transparent text-slate-400 hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}
      >
        Market
      </div>
    </div>
  );
}

function BuyButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === "buy" ? "border-b-greenBorder bg-greenBackgroundTransparent" : " hover:border-b-neutral-600 border-b-neutral-800 "}`}
      onClick={() => setActiveTab("buy")}
    >
      <p className="text-center text-lg font-semibold text-green-500">Buy</p>
    </div>
  );
}

function SellButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === "sell" ? "border-b-redBorder bg-redBackgroundTransparent" : " hover:border-b-neutral-600 border-b-neutral-800 "}`}
      onClick={() => setActiveTab("sell")}
    >
      <p className="text-center text-lg font-semibold text-red-500">Sell</p>
    </div>
  );
}
