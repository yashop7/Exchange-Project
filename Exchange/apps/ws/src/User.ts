import { WebSocket } from "ws";
import { OutgoingMessage } from "./types/out";
import { SubscriptionManager } from "./SubscriptionManager";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/in";

export class User {
    private id: string;
    private ws: WebSocket;
    private subscriptions: string[] = [];

    constructor(id: string, ws: WebSocket) {
        this.id = id;
        this.ws = ws;
        this.addListeners();
    }

    public subscribe(subscription: string) {
        this.subscriptions.push(subscription);
    }

    public unsubscribe(subscription: string) {
        this.subscriptions = this.subscriptions.filter(s => s !== subscription);
    }

    emit(message: OutgoingMessage) {
        console.log("message: ", message);
        this.ws.send(JSON.stringify(message)); //This Message will reach Frontend
    }

    private addListeners() {
        this.ws.on("message", (message: string) => { //This is the Message that is coming from the Frontend
            const parsedMessage: IncomingMessage = JSON.parse(message);
            if (parsedMessage.method === SUBSCRIBE) {
                parsedMessage.params.forEach(s => SubscriptionManager.getInstance().subscribe(this.id, s));
            }

            if (parsedMessage.method === UNSUBSCRIBE) {
                parsedMessage.params.forEach(s => SubscriptionManager.getInstance().unsubscribe(this.id, parsedMessage.params[0]));
            }// SubscriptionManager => Managing subcriptions of the user to the PubSub
        });
    }

}