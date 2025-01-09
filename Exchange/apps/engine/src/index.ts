import { createClient, } from "redis";
import { Engine } from "./trade/Engine";


async function main() {
    const engine = new Engine(); 
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis Queue");

    while (true) { //Running a While loop while Loop which will fetch message from the Queue
        const response = await redisClient.rPop("messages" as string)
        if (!response) {

        }  else {
            engine.process(JSON.parse(response)); // { message, clientId }
        }        
    }

}

main();