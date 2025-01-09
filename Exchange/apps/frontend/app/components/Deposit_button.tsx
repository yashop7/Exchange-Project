"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Coins } from "lucide-react";
import { SuccessButton } from "./core/Button";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/httpClient";
import { useToast } from "@/hooks/use-toast";


export default function DepositModal() {
  const { toast } = useToast()
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response  = await axios.post(`${BASE_URL}/order/onramp`, {
        amount,
        userId: "1",
      });
      
      console.log("response: ", response.data.message);
      toast({
        variant: "success",
        title: "Success!",
        description: "Money has been deposited successfully",
      })
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to Deposit Money",
      })

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
      <button type="button" className="text-center font-semibold rounded-lg focus:ring-green-200 focus:none focus:outline-none disabled:opacity-80  relative overflow-hidden h-[32px] text-sm px-3 py-1.5 mr-4 ">
        <div className="absolute inset-0 bg-green-500 opacity-[16%]"></div>
        <div className="flex flex-row items-center justify-center gap-4"><p className="text-green-500">Deposit</p></div>
    </button>
      </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] backdrop-blur-lg bg-[#0E0F14] text-white border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-white">
        Deposit Funds
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center space-x-2">
          <Label
            htmlFor="INR"
            className="flex text-lg items-center space-x-2 cursor-pointer text-gray-200"
          >
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Image src="/usdc copy.webp" alt="INR" width={40} height={40} />
            </div>
            <span>INR</span>
          </Label>
        </div>
        <div className="space-y-2">
        <Label htmlFor="amount" className="text-right text-gray-200">
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500"
        />
        </div>
      </div>
      <Button
        variant={"default"}
        onClick={handleClick}
        disabled={isLoading}
        data-loading={isLoading}
        className="group relative disabled:opacity-100 hover:bg-white/90 bg-white text-black"
      >
        <span className="group-data-[loading=true]:text-transparent">Deposit</span>
        {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="animate-spin" size={16} strokeWidth={2} aria-hidden="true" />
        </div>
        )}
      </Button>
    </DialogContent>
    </Dialog>
  );
}
