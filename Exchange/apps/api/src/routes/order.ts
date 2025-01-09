import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { CREATE_ORDER, CANCEL_ORDER, ON_RAMP, GET_OPEN_ORDERS } from "../types";

export const orderRouter = Router();

orderRouter.post("/", async (req, res) => { //User makes a Request Here
    const { market, price, quantity, side, userId } = req.body;
    console.log("req.body: ", req.body);
    console.log({ market, price, quantity, side, userId })
    //TODO: can u make the type of the response object right? Right now it is a union.
    const response = await RedisManager.getInstance().sendAndAwait({ //Sending it to Queue and then waiting for the 
        //Answer from the Pub-Sub
        type: CREATE_ORDER,
        data: {
            market,
            price,
            quantity,
            side,
            userId
        }
    });
    res.json(response.payload);
});

orderRouter.delete("/", async (req, res) => {
    const { orderId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CANCEL_ORDER,
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
});

orderRouter.get("/open", async (req, res) => {
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId: req.query.userId as string,
            market: req.query.market as string
        }
    });
    res.json(response.payload);
});

orderRouter.post("/onramp", async (req, res) => {
    const { amount, userId } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: ON_RAMP,
        data: {
            amount,
            userId,
            // txnId
        }
    });
    res.json(response.payload);
})


orderRouter.get("/balance/:userId", async (req, res) => {
    try{
        const { userId } = req.params;
        console.log("userId: ", userId);
        const response = await RedisManager.getInstance().sendAndAwait({
            type: "GET_BALANCE",
            data: {
                userId: userId as string,
            },
        });
        res.json(response.payload);
    }
    catch(e){
        console.log("Error: ", e);
    }
});