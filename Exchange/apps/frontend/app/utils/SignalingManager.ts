import { Ticker } from "./types";

// export const BASE_URL = "wss://ws.backpack.exchange/"
export const BASE_URL = "ws://localhost:3001"

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }


    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }
        this.ws.onmessage = (event) => {
            //THESE ARE THE EVENT PUSHED BY THE PUBSUB

//TICKER-UPDATES
            // export type TickerUpdateMessage = {
            //     stream: string, 
            //     data: {
            //         c?: string,
            //         h?: string,
            //         l?: string,
            //         v?: string,
            //         V?: string,
            //         s?: string,
            //         id: number,
            //         e: "ticker"
            //     }

//TRADE-UPDATES
            // RedisManager.getInstance().publishMessage(`trade@${market}`, {
            //     stream: `trade@${market}`,
            //     data: {
            //         e: "trade", //This is event
            //         t: fill.tradeId,
            //         m: fill.otherUserId === userId, // TODO: Is this right? isBuyerMaker True or False
            //         p: fill.price,
            //         q: fill.qty.toString(),
            //         s: market,
            //     }
            // });

//DEPTH-UPDATES
            // if (side === "buy") {
            //     //Asks which are Updated will be Published
                        //we are checking every Entry of the asks Table and checking if it is present in the fills Array
            //     const updatedAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            //     const updatedBid = depth?.bids.find(x => x[0] === price);
            //     console.log("publish ws depth updates");
            //     RedisManager.getInstance().publishMessage(`depth.200ms.${market}`, {
            //         stream: `depth.200ms.${market}`,
            //         data: {
            //             a: updatedAsks,
            //             b: updatedBid ? [updatedBid] : [],
            //             e: "depth"
            //         }
            //     });
            // }
            // if (side === "sell") {
            //    const updatedBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            //    const updatedAsk = depth?.asks.find(x => x[0] === price);
            //    console.log("publish ws depth updates")
            //    RedisManager.getInstance().publishMessage(`depth.200ms.${market}`, {
            //        stream: `depth.200ms.${market}`,
            //        data: {
            //            a: updatedAsk ? [updatedAsk] : [],
            //            b: updatedBids,
            //            e: "depth"
            //        }
            //    });
            // }


            console.log("event: ", event);
            const message = JSON.parse(event.data);
            console.log("message: ", message);
            const type = message.data.e;
            console.log("message.stream: ", message.stream);
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback  } : {callback : any}) => {
                    // console.log("Bhai Ticker Toh aa rahi hai")
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                        }
                        console.log(newTicker);
                        callback(newTicker);
                   }
                   if (type === "depth") {
                    // console.log("Bhai Depth Toh aa rahi hai")
                        // const newTicker: Partial<Ticker> = {
                        //     lastPrice: message.data.c,
                        //     high: message.data.h,
                        //     low: message.data.l,
                        //     volume: message.data.v,
                        //     quoteVolume: message.data.V,
                        //     symbol: message.data.s,
                        // }
                        // console.log(newTicker);
                        // callback(newTicker);
                        const updatedBids = message.data.b;
                        const updatedAsks = message.data.a;
                        callback({ bids: updatedBids, asks: updatedAsks });
                    }
                    if(type === "trade") {
                        // console.log("Bhai Trade Toh aa rahi hai")
                        const newTrade = {
                            tradeId: message.data.t,
                            isBuyerMaker: message.data.m,
                            price: message.data.p,
                            quantity: message.data.q,
                            symbol: message.data.s
                        }
                        callback(newTrade);
                    }
                });
            }
        }
    }

    sendMessage(message: any) {
        const messageToSend = {
            ...message,
            id: this.id++
        }
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
        // "ticker" => callback
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex((callback: { id: string; }) => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}