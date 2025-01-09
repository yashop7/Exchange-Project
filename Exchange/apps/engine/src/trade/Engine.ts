import fs from "fs";
import { RedisManager } from "../RedisManager";
import { ORDER_UPDATE, TRADE_ADDED } from "../types/index";
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, ON_RAMP, GET_BALANCE } from "../types/fromApi";
import { Fill, Order, Orderbook } from "./OrderBook";

//TODO: Avoid floats everywhere, use a decimal similar to the PayTM project for every currency
export const BASE_CURRENCY = "INR";

interface UserBalance {
    [key: string]: {
        available: number;
        locked: number;
    }
}

export class Engine {
    private orderbooks: Orderbook[] = [];
    private balances: Map<string, UserBalance> = new Map();
    //This is How balances will Look like , we will come on what is locked
    // {
    //     user1: {
    //       ETH: {
    //         available: 100,
    //         locked: 0
    //       },
    //       SOL: {
    //         available: 100,
    //         locked: 0
    //       }
    //     },
    //     user2: {
    //       ETH: {
    //         available: 100,
    //         locked: 0
    //       },
    //       SOL: {
    //         available: 100,
    //         locked: 0
    //       }
    //     }
    // }
    constructor() {
        let snapshot = null
        try {
            if (process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json");
            }
        } catch (e) {
            console.log("No snapshot found");
        }

        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderbooks = snapshotSnapshot.orderbooks.map((o: any) => new Orderbook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(snapshotSnapshot.balances);
        } else {
            this.orderbooks = [new Orderbook(`TATA`, [], [], 0, 0)];
            this.setBaseBalances();
        }
        setInterval(() => {
            this.saveSnapshot();
        }, 1000 * 3);
    }

    saveSnapshot() {
        const snapshotSnapshot = {
            orderbooks: this.orderbooks.map(o => o.getSnapshot()),
            balances: Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }

    process({ message, clientId }: {message: MessageFromApi, clientId: string}) {
        switch (message.type) {
            case CREATE_ORDER:
                try {
                    // {
                    //     market,
                    //     price,
                    //     quantity,
                    //     side,
                    //     userId
                    // }
                    const { executedQty, fills, orderId } = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId, {
                        //This is us telling the PubSUB the response which will reach to User
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills
                        }
                    });
                } catch (e) {
                    console.log("Failed to EXECUTE THE ORDER")
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                break;
            case CANCEL_ORDER:
                try {
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market;
                    const cancelOrderbook = this.orderbooks.find(o => o.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if (!cancelOrderbook) {
                        throw new Error("No orderbook found");
                    }

                    const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                    if (!order) {
                        console.log("No order found");
                        throw new Error("No order found");
                    }

                    if (order.side === "buy") {
                        const price = cancelOrderbook.cancelBid(order)
                        const leftQuantity = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    } else {
                        const price = cancelOrderbook.cancelAsk(order)
                        const leftQuantity = order.quantity - order.filled;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                    
                } catch (e) {
                    console.log("Error while cancelling order", );
                    console.log(e);
                }
                break;
            case GET_OPEN_ORDERS: // Currently present Orders on the Book
                try {
                    const openOrderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if (!openOrderbook) {
                        throw new Error("No orderbook found");
                    }
                    const openOrders = openOrderbook.getOpenOrders(message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders
                    }); 
                } catch(e) {
                    console.log(e);
                }
                break;
            case ON_RAMP: //Balance of User should go up If he increased his Balance in Exchange 
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                RedisManager.getInstance().sendToApi(clientId, {
                    type: "ON_RAMP",
                    payload: {
                        message: "Money has been deposited successfully"
                    }
                });
                break;
            case GET_DEPTH: //Know about Current OrderBook Details
                try {
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.ticker() === market);
                    if (!orderbook) {
                        throw new Error("No orderbook found");
                    }
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: orderbook.getDepth()
                    });
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: {
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
            case GET_BALANCE :
                const balance = this.getBalanceofUser(message.data.userId);
                RedisManager.getInstance().sendToApi(clientId, {
                    type: "BALANCE",
                    payload: {
                        userId: message.data.userId,
                        balance: balance?.INR?.toString() || "0",
                        inr : balance?.TATA?.toString() || "0"
                    }
                });
                break; 
        }
    }

    addOrderbook(orderbook: Orderbook) { //It is not used anywhere
        this.orderbooks.push(orderbook);
    }

    createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string) {
        console.log(this.orderbooks);
        const orderbook = this.orderbooks.find(o => o.ticker() === market) // o.ticker() =>  return `${this.baseAsset}_${this.quoteAsset}`;
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];

        if (!orderbook) {
            throw new Error("No orderbook found");
        }

        //Before anY logic happens inside the orderbook , you will have to lock the User's Balance
        // Means If he put 20$ out of 100$ he has, inside the Orders then his Account should show 80$
        this.checkAndLockFunds(baseAsset, quoteAsset, side, userId, quoteAsset, price, quantity);

        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId
        }
        
        //We will divert the Order into the Right OrderBook
        const { fills, executedQty } = orderbook.addOrder(order);
        console.log("fills: ", fills);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);

        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        console.log("Publishing to WS");
        console.log("This is the Price which is proposed by the User: ", price);

        this.publisWsDepthUpdates(fills, price, side, market); // Publishing Depth Via PubSub
        this.publishWsTrades(fills, userId, market); //Publishing Trades Via PubSib
        return { executedQty, fills, orderId: order.orderId };
    }

    updateDbOrders(order: Order, executedQty: number, fills: Fill[], market: string) {
        RedisManager.getInstance().pushMessage({
            type: ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            }
        });

        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: ORDER_UPDATE,
                data: {
                    //This OrderID is the other PERSON OrderId which we have Traded with
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty
                }
            });
        });
    }

    //Created the DB Table for each Fill in the order
    createDbTrades(fills: Fill[], market: string, userId: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId, // TODO: Is this right?
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now()
                }
            });
        });
    }

    publishWsTrades(fills: Fill[], userId: string, market: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().publishMessage(`trade.${market}`, {
                stream: `trade.${market}`,
                data: {
                    e: "trade", //This is event
                    t: fill.tradeId,
                    m: fill.otherUserId === userId, // TODO: Is this right? isBuyerMaker True or False
                    p: fill.price,
                    q: fill.qty.toString(),
                    s: market,
                }
            });
        });
    }
    
    publisWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        console.log("depth: ", depth);
        console.log("fills: ", fills);
        if (side === "buy") {
            //Asks which are Updated will be Published
            //we are checking every Entry of the asks Table and checking if it is present in the fills Array

            //In updatedAsks => Fills has the prices which are proposed by the Other User
            //in Updatedbids => we will change the Price which is Proposed by
            let updatedAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0]));
            if(updatedAsks.length === 0) {
                console.log("updatedAsks is 0")
                updatedAsks = fills.map(f => [f.price, "0"]);
            }
            const updatedBid = depth?.bids.find(x => (x[0]) === (price));
            console.log("updatedAsks: ", updatedAsks);
            console.log("updatedBid: ", updatedBid);
            console.log("publish ws depth updates buy")
            RedisManager.getInstance().publishMessage(`depth.200ms.${market}`, {
                stream: `depth.200ms.${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            });
        }
        if (side === "sell") {
        let updatedBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
        if(updatedBids.length === 0) {
            console.log("updatedBids is 0")
            updatedBids = fills.map(f => [f.price, "0"]);
        }
        const updatedAsk = depth?.asks.find(x => x[0] === price);
           console.log("updatedBids: ", updatedBids);
           console.log("updatedAsk: ", updatedAsk);
           console.log("publish ws depth updates sell")
           RedisManager.getInstance().publishMessage(`depth.200ms.${market}`, {
               stream: `depth.200ms.${market}`,
               data: {
                   a: updatedAsk ? [updatedAsk] : [],
                   b: updatedBids,
                   e: "depth"
               }
           });
        }
    }

    sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);
        
        RedisManager.getInstance().publishMessage(`depth.200ms.${market}`, {
            stream: `depth.200ms.${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }


    // THIS FUCNTION IS VERY COOL , i LOVE IT
    //Updating the User Balance
    //CHECK THE DAIRY THERE I HAVE EXPLAINED VIA DAIGRAM
    updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[], executedQty: number) {
        if (side === "buy") {
            fills.forEach(fill => {
                //Updating the QuoteAsset of Other User and Base Asset of Us
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = this.balances.get(fill.otherUserId)?.[quoteAsset].available + (fill.qty * fill.price);

                //Reducing the QuoteAsset from the Locked Amount in the Balances as It has Been Utilised
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked - (fill.qty * fill.price);

                // Update base asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked = this.balances.get(fill.otherUserId)?.[baseAsset].locked - fill.qty;

                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available + fill.qty;

            });
            
        } else {
            fills.forEach(fill => {
                //Updating the BaseAsset of Other User and QuoteAsset of Us
                //Reducing the Money from the Locked Account of other userId
                //And money should be Incremented in our Account
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked = this.balances.get(fill.otherUserId)?.[quoteAsset].locked - (fill.qty * fill.price);

                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available + (fill.qty * fill.price);

                // Update base asset balance

                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available = this.balances.get(fill.otherUserId)?.[baseAsset].available + fill.qty;

                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked - (fill.qty);

            });
        }
    }

    checkAndLockFunds(baseAsset: string, quoteAsset: string, side: "buy" | "sell", userId: string, asset: string, price: string, quantity: string) {
        if (side === "buy") {
            if ((this.balances.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price)) {
                //This Price is Price/Unit
                throw new Error("Insufficient funds");
            }

            //Updating Your Locked and Available Balance
            
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available - (Number(quantity) * Number(price));
            
            //Adding into the Locked Funds
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked + (Number(quantity) * Number(price));
        } else {
            if ((this.balances.get(userId)?.[baseAsset]?.available || 0) < Number(quantity)) {
                throw new Error("Insufficient funds");
            }

            //@ts-ignore
            this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available - (Number(quantity));
            
            //Locking the Base Asset
            //@ts-ignore
            this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked + Number(quantity);
        }
    }

    onRamp(userId: string, amount: number) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            });
        } else {
            userBalance[BASE_CURRENCY].available += amount;
        }
    }


    setBaseBalances() {
        this.balances.set("1", {
            [BASE_CURRENCY]: {
                available: 1000000,
                locked: 0
            },
            "TATA": {
                available: 1000000,
                locked: 0
            }
        });

        this.balances.set("2", {
            [BASE_CURRENCY]: {
                available: 1000000,
                locked: 0
            },
            "TATA": {
                available: 1000000,
                locked: 0
            }
        });

        this.balances.set("5", {
            [BASE_CURRENCY]: {
                available: 1000000,
                locked: 0
            },
            "TATA": {
                available: 1000000,
                locked: 0
            }
        });
        
    }

    getBalanceofUser(userId: string) {
        return {
            INR : this.balances.get(userId)?.[BASE_CURRENCY].available,
            TATA : this.balances.get(userId)?.["TATA"].available
        }
    }

}