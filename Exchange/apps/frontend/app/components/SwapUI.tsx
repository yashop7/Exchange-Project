"use client";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/httpClient";
import { useToast } from "@/hooks/use-toast";
import { OrderFillResponse } from "../utils/types";
import { ToastAction } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";

export function SwapUI({ market }: { market: string }) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [balance, setBalance] = useState("");
  const [inr  , setInr] = useState("");
  const [orderPlaced , setOrderPlaced] = useState(false); //For when we place an order then it will alert the useEffect to fetch the balance again

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await axios.get(`${BASE_URL}/order/balance/1`);
        setBalance(response.data.balance);
        setInr(response.data.inr);
        console.log("Balance fetched:", response.data);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }

    setInterval(() => {
      fetchBalance();
    },3000);
  } ,  [])

  return (
    <div>
      <div className="flex font-mono flex-col text-white">
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
                

                <div className="space-y-2">
          <Label className="text-slate-400">Available Balance</Label>
          <div className="grid grid-cols-1 text-slate-400 gap-2">
            <div className="border-baseBorderLight border-2 border-solid flex items-center justify-between p-3 rounded-lg bg-transparent">
              <span className="text-sm text-muted-foreground">
              <div className="relative">
                      <img src="/usdc copy.webp" className="w-6 h-6" />
                    </div>

              </span>
              <span className="">{parseFloat(balance).toFixed(2) || "0"}</span>
            </div>
            <div className="border-baseBorderLight border-2 border-solid flex items-center justify-between p-3 rounded-lg bg-transparent">
              <span className="text-sm text-muted-foreground">
              <div className="relative">
                      <img src="/TATA.png" className="size-7 rounded-full" />
                    </div>
              </span>
              <span className="">{parseFloat(inr).toFixed(7) ?? "0"}</span>
            </div>
          </div>
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
                    value={price ? parseFloat(price).toLocaleString("en-US") : ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      // Only allow numbers and decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setPrice(value);
                      }
                    }}
                  />
                  <div className="flex flex-row absolute right-1 top-1 p-2">
                    <div className="relative">
                      <img src="/usdc copy.webp" className="w-6 h-6" />
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
                  value={
                    quantity ? parseFloat(quantity).toLocaleString("en-US") : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    // Only allow numbers and decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setQuantity(value);
                    }
                  }}
                />
                <div className="flex flex-row absolute right-1 top-1 p-2">
                  <div className="relative">
                    <img src="/TATA.png" className="w-6 h-6" />
                  </div>
                </div>
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
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-sm md:text-base font-normal text-slate-400">
                Order Value
              </p>
              <div className="flex flex-col relative mb-2">
                <input
                  step="0.01"
                  placeholder="0"
                  className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                  type="text"
                  value={
                    price && quantity
                      ? (
                          parseFloat(price) * parseFloat(quantity)
                        ).toLocaleString("en-US", {
                          // minimumFractionDigits: 2,
                          // maximumFractionDigits: 2,
                        })
                      : ""
                  }
                  readOnly
                />
                <div className="flex flex-row absolute right-1 top-1 p-2">
                  <div className="relative">
                    <img src="/usdc copy.webp" className="w-6 h-6" />
                  </div>
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
              onClick={async () => {
                try {
                  console.log("Placing order...");
                  console.log("market: ", market);
                  console.log("price: ", price);
                  
                  console.log("BASE_URL: ", BASE_URL);
                  console.log("quantity: ", quantity);
                  const response   = await axios.post(
                    `${BASE_URL}/order`,
                    {
                      market: market,
                      price: price.toString(),
                      quantity: quantity.toString(),
                      side: activeTab.toString(),
                      userId: "1", // You might want to get this from authentication
                    }
                  );
                  console.log("response: ", response.data);
                  setOrderPlaced(!orderPlaced);
                  toast({
                    variant: "success",
                    title: "Success!",
                    description: "Your order has been placed",
                  })

                  // You might want to show a success message here
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                  })
          
                  console.error("Error placing order:", error);
                  // You might want to show an error message here
                }
              }}
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
        className={`text-base  font-medium py-1 border-b-2 ${
          type === "limit"
            ? "border-accentBlue text-white"
            : "border-transparent text-slate-400 hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"
        }`}
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
        className={`text-base  font-medium py-1 border-b-2 ${
          type === "market"
            ? "border-accentBlue text-accentBlue"
            : "border-b-2 border-transparent text-slate-400 hover:border-baseTextHighEmphasis hover:text-accentBlue"
        } `}
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
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${
        activeTab === "buy"
          ? "border-b-greenBorder bg-greenBackgroundTransparent"
          : " hover:border-b-neutral-600 border-b-neutral-800 "
      }`}
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
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${
        activeTab === "sell"
          ? "border-b-redBorder bg-redBackgroundTransparent"
          : " hover:border-b-neutral-600 border-b-neutral-800 "
      }`}
      onClick={() => setActiveTab("sell")}
    >
      <p className="text-center text-lg font-semibold text-red-500">Sell</p>
    </div>
  );
}
