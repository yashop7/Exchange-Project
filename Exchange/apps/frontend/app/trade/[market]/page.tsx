"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { OrderTable } from "@/app/components/OrderTable";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { usePathname } from "next/navigation";

export default function Page() {

    const pathname = usePathname();
    const segments = pathname.split("/");
    const market = segments[segments.length - 1];

    return (
        <div className="flex flex-col font-mono lg:flex-row w-full h-full">
            <div className="flex flex-col lg:w-3/4 h-full">
            {/* MarketBar at the top */}
            <div className="w-full">
            <MarketBar market={market as string} />
            </div>

            <div className="flex flex-col lg:flex-row w-full h-full">
            {/* Left half for TradeView */}
            <div className="lg:w-2/3 flex flex-col">
            <TradeView market={market as string} />
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-neutral-800" />

            {/* Right half split between Depth and SwapUI */}
            <div className="lg:w-1/3 flex flex-col lg:flex-row h-full">
            <div className="flex-1 p-1 overflow-auto no-scrollbar" style={{ maxHeight: "75vh" }}>
                <Depth market={market as string} />
            </div>
            <div className="border-t lg:border-t-0 lg:border-l border-neutral-800" />
            </div>
            </div>
            <div>
                <OrderTable />
            </div>
            </div>

            {/* SwapUI at the bottom on mobile, right on larger screens */}
            <div className="lg:w-1/4 overflow-auto lg:order-none order-last">
            <SwapUI market={market as string} />
            </div>


        </div>
    );
}