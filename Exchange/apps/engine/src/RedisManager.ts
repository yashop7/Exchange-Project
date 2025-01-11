import { DEPTH_UPDATE, TICKER_UPDATE } from "./trade/events";
import { RedisClientType, createClient } from "redis";
import { ORDER_UPDATE, TRADE_ADDED } from "./types";
import { WsMessage } from "./types/toWs";
import { MessageToApi } from "./types/toApi";

type DbMessage = {
    type: typeof TRADE_ADDED,
    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    }
} | {
    type: typeof ORDER_UPDATE,
    data: {
        orderId: string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell",
    }
}

export class RedisManager {
    private client: RedisClientType;
    private static instance: RedisManager;

    constructor() {
        this.client = createClient();
        this.client.connect();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
  
    public pushMessage(message: DbMessage) { //This is here we are Pushing into the Queue which is reaching the DB
        console.log("----------------------------------");
        console.log("Sending this Message to DB: ", message);
        console.log("----------------------------------");
        this.client.lPush("db_processor", JSON.stringify(message));
    }

    public publishMessage(channel: string, message: WsMessage) { //THIS IS the Second PubSub which talks to the WS Server
        console.log("PUBLISHING MESSAGE TO CHANNEL", channel, message);
        this.client.publish(channel, JSON.stringify(message));
    }
    //SEARCH FOR THIS LINE IN WS SERVER
    // this.redisClient.subscribe(subscription, this.redisCallbackHandler);


    public sendToApi(clientId: string, message: MessageToApi) { //This is the First PubSub which Talks to the API Server
        this.client.publish(clientId, JSON.stringify(message));
    }
}