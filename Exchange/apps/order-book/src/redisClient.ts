import { createClient } from "redis";

const client = createClient();

client.connect();

export default client;
//Initialised our Redis Client;