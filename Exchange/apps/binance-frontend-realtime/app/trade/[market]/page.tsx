"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { usePathname } from "next/navigation";

export default function Page() {

    const pathname = usePathname();
    const segments = pathname.split("/");
    const market = segments[segments.length - 1];
    console.log("market: ", market);

    return (
    <div className="flex w-full h-full">
        {/* Left half for TradeView */}
        <div className="w-1/2 p-2" >
            <TradeView market={market as string} />
        </div>

        <div className="border-l border-neutral-800" />

        {/* Right half split between Depth and SwapUI */}
        <div className="flex flex-col lg:flex-row w-1/2 h-full">
            <div className="flex-1 p-2 overflow-auto"  style={{ maxHeight: "75vh" }}>
                <Depth market={market as string} />
            </div>
            <div className="border-t md:border-t-0 md:border-l border-neutral-800" />
            <div className="flex-1 p-2 overflow-auto">
                <SwapUI market={market as string} />
            </div>
        </div>
    </div>
    );
}