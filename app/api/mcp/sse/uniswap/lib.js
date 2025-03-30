import {chainIdToMoralis, ChainRpc} from "@/app/const/server";
import {ethers} from "ethers";
import {getTokensMetadata} from "@/app/api/mcp/sse/moralis/lib";
import {CurrencyAmount, Percent, Token, TradeType} from "@uniswap/sdk-core";
import {AlphaRouter, SwapType} from "@uniswap/smart-order-router";
import ky from "ky";
import {Pair, Route, Trade} from "@uniswap/v2-sdk";

export async function getRoute(walletAddress, inTokenAddress, outTokenAddress, chainId, amountIn) {
    try {
        let inDecimal, outDecimal

        if (inTokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            inDecimal = "18"
            const tokenInfo = await getTokensMetadata([outTokenAddress], chainIdToMoralis[chainId])
            outDecimal = tokenInfo[0].decimals
        }
        if (outTokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            outDecimal = "18"
            const tokenInfo = await getTokensMetadata([inTokenAddress], chainIdToMoralis[chainId])
            inDecimal = tokenInfo[0].decimals
        }
        if (inTokenAddress.toLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && outTokenAddress.toLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            const tokenInfo = await getTokensMetadata([inTokenAddress, outTokenAddress], chainIdToMoralis[chainId])
            inDecimal = tokenInfo[0].decimals
            outDecimal = tokenInfo[1].decimals
        }
        const route = await ky.get('https://api.paraswap.io/prices', {
            searchParams: {
                srcToken: inTokenAddress,
                srcDecimals: parseInt(inDecimal),
                destToken: outTokenAddress,
                amount: amountIn * 10 ** parseInt(inDecimal).toString(),
                destDecimals: parseInt(outDecimal),
                network: chainId,
            }
        }).json()

        const priceRoute = route.priceRoute
        console.log(priceRoute)
        const tx = await ky.post(`https://api.paraswap.io/transactions/${chainId}`, {
            json: {
                srcToken: priceRoute.srcToken,
                srcDecimals: inDecimal,
                destToken: priceRoute.destToken,
                destDecimals: outDecimal,
                srcAmount: priceRoute.srcAmount,
                destAmount: priceRoute.destAmount,
                priceRoute: priceRoute,
                userAddress: walletAddress,
                txOrigin: walletAddress,
                receiver: walletAddress,
            },
        }).json()
        console.log('tx', tx)
        return tx
    } catch (e) {
        console.log(e)
    }
}
