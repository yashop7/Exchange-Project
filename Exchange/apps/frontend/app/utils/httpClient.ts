import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";
// const BASE_URL = "https://api.backpack.exchange/api/v1";
export const BASE_URL = "http://localhost:3003/api/v1";


export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find((t : Ticker) => t.symbol === market);
    // if (!ticker) {
    //     throw new Error(`No ticker found for ${market}`);
    // }
    return ticker;
}


export async function getAllInfo() {
    try {
        const response = await fetch('https://price-indexer.workers.madlads.com/?ids=solana,usd-coin,pyth-network,jito-governance-token,tether,bonk,helium,helium-mobile,bitcoin,ethereum,dogwifcoin,jupiter-exchange-solana,parcl,render-token,tensor,wormhole,wen-4,cat-in-a-dogs-world,book-of-meme,raydium,hivemapper,kamino,drift-protocol,nyan,jeo-boden,habibi-sol,io,zeta,mother-iggy,sanctum-2,moo-deng,debridge,shuffle-2,pepe,shiba-inu,chainlink,uniswap,ondo-finance,holograph,starknet,matic-network,mon-protocol,blur,worldcoin-wld,polyhedra-network,unagi-token,layerzero,aave,lido-dao,matr1x,polygon-ecosystem-token');  // Make sure it's relative path
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);  // Handle errors
        }
        const data = await response.json();  // Parse the JSON response
        return data;  // Return the data if needed
      } catch (error) {
        console.error("Error fetching data:", error);  // Handle fetch errors
      } 
}

export async function getTickers() {
    try {
        const response = await fetch('/api/tickers');  // Make sure it's relative path
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);  // Handle errors
        }
        const data = await response.json();  // Parse the JSON response
        return data;  // Return the data if needed
      } catch (error) {
        console.error("Error fetching data:", error);  // Handle fetch errors
      }
    }


export async function getDepth(market: string): Promise<Depth> {
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}
export async function getTrades(market: string): Promise<Trade[]> {
    const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
    
    return response.data;
}
// https://api.backpack.exchange/api/v1/klines?symbol=BTC_USDC&interval=1h&startTime=1728937800&endTime=1728943200
// https://api.backpack.exchange/api/v1/klines?symbol=SOL_USDC&interval=1h&startTime=1729523712&endTime=1730128512


// export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
//     const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
//     const data: KLine[] = response.data;
//     console.log("data: ", data);
//     return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
// }

export async function getKlines(market: string, interval: string, startTime: number, endTime: number) {
    try {
        const response = await fetch(`/api/v1/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        return result;
    } catch (err) {
        console.error('Error:', err);
    }

}
export async function getMarketKlines( startTime: number, endTime: number) {
    try {
        const response = await fetch(`https://api.backpack.exchange/wapi/v1/marketDataKlines?interval=6h&startTime=${startTime}&endTime=${endTime}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        return result;
    } catch (err) {
        console.error('Error:', err);
    }

}
