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
