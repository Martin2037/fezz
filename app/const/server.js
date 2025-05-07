import {createPublicClient, http} from "viem";
import {sepolia} from "viem/chains";

export const chainIdToMoralis = {
    "1": 'eth',
    "56": 'bsc',
    "8453": 'base',
    "42161": 'arbitrum',
}

export const ParaSwapAddr = {
    "1": "",
    "56": "",
    "8453": "",
    "42161": "0x216b4b4ba9f3e719726886d34a177484278bfcae"
}


// sepolia testnet
export const TEST_MCP_REGISTRY = "0x2Ec51Fda050f71acE799F3872549C34EC5C557A9"

export const MCP_REGISTRY_ABI =  [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getUserPurchases",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "getUserServers",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextServerId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_serverId",
                "type": "uint256"
            }
        ],
        "name": "purchaseServerAccess",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "purchaseId",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "purchases",
        "outputs": [
            {
                "internalType": "address",
                "name": "purchaser",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "serverId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_serverName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_serverAddress",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_localServerAddress",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_author",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_avatar",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "_tags",
                "type": "string[]"
            },
            {
                "internalType": "uint256",
                "name": "_purchasePrice",
                "type": "uint256"
            }
        ],
        "name": "registerServer",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "serverId",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "servers",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "serverName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "serverAddress",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "localServerAddress",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "author",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "avatar",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "purchasePrice",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isFeatured",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "isEnabled",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "registrationTime",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_serverId",
                "type": "uint256"
            }
        ],
        "name": "toggleServerStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userPurchases",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userServers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

// TODO change to bsc
export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
})

export const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';

export const idl = {
    "version": "0.1.0",
    "name": "pump",
    "instructions": [
        {
            "name": "initialize",
            "docs": [
                "Creates the global state."
            ],
            "accounts": [
                {
                    "name": "global",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "setParams",
            "docs": [
                "Sets the global state parameters."
            ],
            "accounts": [
                {
                    "name": "global",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "eventAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "program",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "feeRecipient",
                    "type": "publicKey"
                },
                {
                    "name": "initialVirtualTokenReserves",
                    "type": "u64"
                },
                {
                    "name": "initialVirtualSolReserves",
                    "type": "u64"
                },
                {
                    "name": "initialRealTokenReserves",
                    "type": "u64"
                },
                {
                    "name": "tokenTotalSupply",
                    "type": "u64"
                },
                {
                    "name": "feeBasisPoints",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "create",
            "docs": [
                "Creates a new coin and bonding curve."
            ],
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "mintAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "bondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedBondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "global",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mplTokenMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "metadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "eventAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "program",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "name": "uri",
                    "type": "string"
                }
            ]
        },
        {
            "name": "buy",
            "docs": [
                "Buys tokens from a bonding curve."
            ],
            "accounts": [
                {
                    "name": "global",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "feeRecipient",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "bondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedBondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedUser",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "eventAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "program",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "maxSolCost",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "sell",
            "docs": [
                "Sells tokens into a bonding curve."
            ],
            "accounts": [
                {
                    "name": "global",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "feeRecipient",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "bondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedBondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedUser",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "eventAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "program",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "minSolOutput",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdraw",
            "docs": [
                "Allows the admin to withdraw liquidity for a migration once the bonding curve completes"
            ],
            "accounts": [
                {
                    "name": "global",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "bondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedBondingCurve",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "associatedUser",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "eventAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "program",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "Global",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "initialized",
                        "type": "bool"
                    },
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "feeRecipient",
                        "type": "publicKey"
                    },
                    {
                        "name": "initialVirtualTokenReserves",
                        "type": "u64"
                    },
                    {
                        "name": "initialVirtualSolReserves",
                        "type": "u64"
                    },
                    {
                        "name": "initialRealTokenReserves",
                        "type": "u64"
                    },
                    {
                        "name": "tokenTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "feeBasisPoints",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "BondingCurve",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "virtualTokenReserves",
                        "type": "u64"
                    },
                    {
                        "name": "virtualSolReserves",
                        "type": "u64"
                    },
                    {
                        "name": "realTokenReserves",
                        "type": "u64"
                    },
                    {
                        "name": "realSolReserves",
                        "type": "u64"
                    },
                    {
                        "name": "tokenTotalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "complete",
                        "type": "bool"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "CreateEvent",
            "fields": [
                {
                    "name": "name",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "symbol",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "uri",
                    "type": "string",
                    "index": false
                },
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "bondingCurve",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "user",
                    "type": "publicKey",
                    "index": false
                }
            ]
        },
        {
            "name": "TradeEvent",
            "fields": [
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "solAmount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "tokenAmount",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "isBuy",
                    "type": "bool",
                    "index": false
                },
                {
                    "name": "user",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                },
                {
                    "name": "virtualSolReserves",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "virtualTokenReserves",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "CompleteEvent",
            "fields": [
                {
                    "name": "user",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "bondingCurve",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "timestamp",
                    "type": "i64",
                    "index": false
                }
            ]
        },
        {
            "name": "SetParamsEvent",
            "fields": [
                {
                    "name": "feeRecipient",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "initialVirtualTokenReserves",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "initialVirtualSolReserves",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "initialRealTokenReserves",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "tokenTotalSupply",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "feeBasisPoints",
                    "type": "u64",
                    "index": false
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "NotAuthorized",
            "msg": "The given account is not authorized to execute this instruction."
        },
        {
            "code": 6001,
            "name": "AlreadyInitialized",
            "msg": "The program is already initialized."
        },
        {
            "code": 6002,
            "name": "TooMuchSolRequired",
            "msg": "slippage: Too much SOL required to buy the given amount of tokens."
        },
        {
            "code": 6003,
            "name": "TooLittleSolReceived",
            "msg": "slippage: Too little SOL received to sell the given amount of tokens."
        },
        {
            "code": 6004,
            "name": "MintDoesNotMatchBondingCurve",
            "msg": "The mint does not match the bonding curve."
        },
        {
            "code": 6005,
            "name": "BondingCurveComplete",
            "msg": "The bonding curve has completed and liquidity migrated to raydium."
        },
        {
            "code": 6006,
            "name": "BondingCurveNotComplete",
            "msg": "The bonding curve has not completed."
        },
        {
            "code": 6007,
            "name": "NotInitialized",
            "msg": "The program is not initialized."
        }
    ],
    "metadata": {
        "address": "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
    }
};
