import {chainIdToMoralis} from "@/app/const/server";
import {getTokensMetadata} from "@/app/api/mcp/sse/moralis/lib";
import ky from "ky";

export async function getRoute(walletAddress, dstTokenAddress, chainId, amount) {
    try {
        let inDecimal = "18", outDecimal
        const srcTokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

        // if (srcTokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        //     inDecimal = "18"
        //     const tokenInfo = await getTokensMetadata([dstTokenAddress], chainIdToMoralis[chainId])
        //     outDecimal = tokenInfo[0].decimals
        // }
        // if (dstTokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        //     outDecimal = "18"
        //     const tokenInfo = await getTokensMetadata([srcTokenAddress], chainIdToMoralis[chainId])
        //     inDecimal = tokenInfo[0].decimals
        // }
        // if (srcTokenAddress.toLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && dstTokenAddress.toLowerCase() !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            const tokenInfo = await getTokensMetadata([dstTokenAddress.toLowerCase()], chainIdToMoralis[chainId])
            outDecimal = tokenInfo[0].decimals
            // outDecimal = tokenInfo[1].decimals
        // }
        const route = await ky.get('https://api.paraswap.io/prices', {
            searchParams: {
                srcToken: srcTokenAddress,
                srcDecimals: parseInt(inDecimal),
                destToken: dstTokenAddress,
                amount: amount * 10 ** parseInt(inDecimal).toString(),
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
                // destAmount: priceRoute.destAmount,
                slippage: 250,
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
