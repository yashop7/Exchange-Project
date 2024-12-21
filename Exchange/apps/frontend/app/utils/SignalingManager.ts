import { Ticker } from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/"

export class SignalingManager {
    
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;

    private constructor() { //We can't Directly Call the class or make a Object
        //We have to call the getInstance() to make a Object as soon as it is get called
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init(); //We have called this function Now it will listen for the WS EVENTS
    }

    public static getInstance() {
        //This function will get called and this will make the Instance inside the class
        if (!this.instance)  {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => { //if there are Buffered Messages we will iterate over it and execute on them
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }

        //On this the message/data will be send by the Server, as you will Subscribe to the Particular Market
        // data will be in the form of
        // {
        //     "data": {
        //       "e": "ticker",   // Event type: "ticker"
        //       "c": "50000",    // Last price: 50000 USD //Closing Price
        //       "h": "51000",    // High price: 51000 USD
        //       "l": "49000",    // Low price: 49000 USD
        //       "v": "1500",     // Volume: 1500 BTC
        //       "V": "75000000", // Quote volume: 75,000,000 USD
        //       "s": "BTC-USD"   // Symbol: BTC-USD
        //     }
        //   }
          
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback } : {callback : any}) => {
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v, //BaseAsset BTC
                            quoteVolume: message.data.V, //QuoteAsset USDC
                            symbol: message.data.s,
                        }
                        callback(newTicker);
                   }
                   if (type === "depth") {
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
                        callback({ bids: updatedBids , asks: updatedAsks });
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
            //If someone has send the message 
            // and the connection is not established then we will save the message into the buffer
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string) { //Callback is a Funciton that is to be Executed
        this.callbacks[type] = this.callbacks[type] || []; //If it Exists then OK , if not we have initialised it with []
        this.callbacks[type].push({ callback, id });
        // "ticker" => callback
    }

    // .deRegisterCallback("ticker", `TICKER-${market}`);
    // .deRegisterCallback("depth", `DEPTH-${market}`);
    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex((callback: { id: string; }) => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1); //removing that Thing from Array
            }
        }
    }
}