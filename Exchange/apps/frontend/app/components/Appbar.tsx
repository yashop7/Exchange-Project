"use client";

import { usePathname } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter } from "next/navigation";
import DepositModal from "./Deposit_button";

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter()

    return <div className="text-white font-mono border-b border-neutral-800">
        <div className="flex justify-between items-center p-4">
            <div className="flex">
                <div className={`text-2xl pl-4 flex flex-col justify-center cursor-pointer text-white`} onClick={() => router.push('/')}>
                    Exchange
                </div>
                <div className={`text-lg md:text-xl pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/markets') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/markets')}>
                    Markets
                </div>
                <div className={`text-lg md:text-xl pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/trade') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/trade/SOL_USDC')}>
                    Trade
                </div>
            </div>
            <div className="flex">
                <div className="p-2 mr-2 flex flex-row">
                    <DepositModal />
                    <PrimaryButton>Withdraw</PrimaryButton>
                </div>
            </div>
        </div>
    </div>
}