import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 *
 * @param {*} walletAddress : PublicKey
 * @param {*} tokenMintAddress : PublicKey
 * @returns
 */
const findAssociatedTokenAddress = (walletAddress, tokenMintAddress) => {
    const [result] = PublicKey.findProgramAddressSync([
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer()
    ], ASSOCIATED_TOKEN_PROGRAM_ID);
    return result;
};

export {
    findAssociatedTokenAddress,
};
