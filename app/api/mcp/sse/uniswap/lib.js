import { chainIdToMoralis, idl, PUMP_FUN_PROGRAM_ID } from "@/app/const/server";
import {
  getSolanaTokenMetadata,
  getTokensMetadata,
} from "@/app/api/mcp/sse/moralis/lib";
import ky from "ky";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { findAssociatedTokenAddress } from "@/app/api/mcp/sse/uniswap/util";
import { BN } from "bn.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { API_URLS } from "@raydium-io/raydium-sdk-v2";

export async function getRoute(
  walletAddress,
  dstTokenAddress,
  chainId,
  amount,
) {
  try {
    let inDecimal = "18",
      outDecimal;
    const srcTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

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
    const tokenInfo = await getTokensMetadata(
      [dstTokenAddress.toLowerCase()],
      chainIdToMoralis[chainId],
    );
    outDecimal = tokenInfo[0].decimals;
    // outDecimal = tokenInfo[1].decimals
    // }
    const route = await ky
      .get("https://api.paraswap.io/prices", {
        searchParams: {
          srcToken: srcTokenAddress,
          srcDecimals: parseInt(inDecimal),
          destToken: dstTokenAddress,
          amount: amount * 10 ** parseInt(inDecimal).toString(),
          destDecimals: parseInt(outDecimal),
          network: chainId,
        },
      })
      .json();

    const priceRoute = route.priceRoute;
    console.log(priceRoute);
    const tx = await ky
      .post(`https://api.paraswap.io/transactions/${chainId}`, {
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
      })
      .json();
    console.log("tx", tx);
    return tx;
  } catch (e) {
    console.log(e);
  }
}

export async function getPumpSwap(walletAddress, dstTokenAddress, amount) {
  const programId = new PublicKey(PUMP_FUN_PROGRAM_ID);
  const mint = new PublicKey(dstTokenAddress);
  const addr = new PublicKey(walletAddress);
  const tokenMetadata = await getSolanaTokenMetadata(dstTokenAddress);
  console.log("metadata", tokenMetadata);

  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    programId,
  );
  const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [bondingCurve.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  console.log("bondingCurvePDA", bondingCurve.toBase58());
  console.log("associated", associatedBondingCurve.toBase58());

  const r = findAssociatedTokenAddress(addr, mint);

  const connection = new Connection(process.env.SOLANA_RPC);
  const provider = {
    connection,
    publicKey: addr,
  };

  const program = new Program(idl, programId, provider);

  const instruction = await program.methods
    .buy(new BN(amount * 10 ** parseInt(tokenMetadata.decimals)), new BN(0))
    .accounts({
      global: new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"),
      feeRecipient: new PublicKey(
        "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM",
      ),
      mint: mint,
      bondingCurve: bondingCurve,
      associatedBondingCurve: associatedBondingCurve,
      associatedUser: r,
      user: addr,
      systemProgram: new PublicKey("11111111111111111111111111111111"),
      tokenProgram: new PublicKey(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      ),
      rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
      eventAuthority: PublicKey.findProgramAddressSync(
        [Buffer.from("__event_authority")],
        programId,
      )[0],
      program: programId,
    })
    .instruction();

  const instructions = [];
  instructions.push(instruction);
  const blockhash = await connection.getLatestBlockhash("finalized");
  const final_tx = new VersionedTransaction(
    new TransactionMessage({
      payerKey: addr,
      recentBlockhash: blockhash.blockhash,
      instructions: instructions,
    }).compileToV0Message(),
  );

  console.log("final_tx", final_tx);
  return final_tx.serialize();
}

export async function getRaydiumSwap(walletAddr, outputMint, amount) {
  const tokenMeta = await getSolanaTokenMetadata(outputMint);
  console.log("tokenMeta", tokenMeta);

  const swapResponse = await ky
    .get(`${API_URLS.SWAP_HOST}/compute/swap-base-out`, {
      searchParams: {
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint,
        amount: amount * 10 ** parseInt(tokenMeta.decimals),
        slippageBps: 50,
        txVersion: "V0",
      },
    })
    .json();
  console.log("swapResponse", swapResponse);

  const { data } = await ky
    .get(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`)
    .json();
  console.log("data", data);
  let swapTx;
  try {
    const response = await fetch(
      `${API_URLS.SWAP_HOST}/transaction/swap-base-out`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          computeUnitPriceMicroLamports: String(data.default.h),
          swapResponse: swapResponse,
          txVersion: "V0",
          wallet: walletAddr,
          wrapSol: true,
          unwrapSol: false,
        }),
      },
    );

    swapTx = await response.json();
    console.log("swapTx", swapTx);
  } catch (e) {
    console.log(e);
  }

  return swapTx.data[0].transaction;
}
