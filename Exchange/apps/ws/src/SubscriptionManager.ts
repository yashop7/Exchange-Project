import { RedisClientType, createClient } from "redis";
import { UserManager } from "./UserManager";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions: Map<string, string[]> = new Map(); //Subscriptions Array of a Particular UserId
  private reverseSubscriptions: Map<string, string[]> = new Map(); //These are Reverse of the Above like that Particular Subscription has that many Array of Users
  private redisClient: RedisClientType;

  private constructor() {
    this.redisClient = createClient(); //This RedisClient is Our PubSub
    this.redisClient.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }
    return this.instance;
  }

  public subscribe(userId: string, subscription: string) {
    if (this.subscriptions.get(userId)?.includes(subscription)) {
      return;
    }

    this.subscriptions.set(
      userId,
      (this.subscriptions.get(userId) || []).concat(subscription)
    );
    this.reverseSubscriptions.set(
      subscription,
      (this.reverseSubscriptions.get(subscription) || []).concat(userId)
    );
    //To check is this the First User which is Subscribing to the market
    if (this.reverseSubscriptions.get(subscription)?.length === 1) {
      this.redisClient.subscribe(subscription, this.redisCallbackHandler);
      // means that the whole server (or the Redis client used by the server)
      //is subscribing to the subscription (channel/stream) on Redis, not the individual user.
    }
  }

  private redisCallbackHandler = (message: string, channel: string) => {
    console.log("HELLO I AM CALLED");
    const parsedMessage = JSON.parse(message);
    this.reverseSubscriptions
      .get(channel)
      ?.forEach((s) =>
        UserManager.getInstance().getUser(s)?.emit(parsedMessage)
      );
  };

  public unsubscribe(userId: string, subscription: string) {
    //These Subscriptions are Actually Streams
    const subscriptions = this.subscriptions.get(userId);

    if (subscriptions) {
      this.subscriptions.set(
        userId,
        subscriptions.filter((s) => s !== subscription)
      );
    }

    const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
    if (reverseSubscriptions) {
      //removing the User from that Particular Subscription
      this.reverseSubscriptions.set(
        subscription,
        reverseSubscriptions.filter((s) => s !== userId)
      );
      if (this.reverseSubscriptions.get(subscription)?.length === 0) {
        //If that was the last person which was interested in the Stream then we will unSubscribe
        this.reverseSubscriptions.delete(subscription);
        this.redisClient.unsubscribe(subscription);
      }
    }
  }

  public userLeft(userId: string) {
    // When the User Leaves then in that case we will remove Every Subscription of that User
    console.log("user left " + userId);
    this.subscriptions.get(userId)?.forEach((s) => this.unsubscribe(userId, s));
  }

  getSubscriptions(userId: string) {
    return this.subscriptions.get(userId) || [];
  }
}
