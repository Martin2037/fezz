import {MCP_REGISTRY_ABI, publicClient, TEST_MCP_REGISTRY} from "@/app/const/server";

const serializeData = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

export async function POST(req) {
    const {address} = await req.json()
    const purchaseIds = await publicClient.readContract({
        address: TEST_MCP_REGISTRY,
        abi: MCP_REGISTRY_ABI,
        functionName: 'getUserPurchases',
        args: [address],
    })
    const serversData = []

    for (let i = 0; i < purchaseIds.length; i++) {
        const server = await publicClient.readContract({
            address: TEST_MCP_REGISTRY,
            abi: MCP_REGISTRY_ABI,
            functionName: 'servers',
            args: [purchaseIds[i]],
        })

        const newServer = {
            id: i,
            owner: server[0],
            name: server[1],
            description: server[2],     // Server description
            url: server[3],  // Server address (connection string)
            localUrl: server[4], // Local server address
            providerName: server[5],     // Author information
            logo: server[6],         // Avatar image URL or hash
            tags: server[7],        // Tags for server categorization
            purchasePrice: server[8], // One-time purchase price (renamed from subscriptionFee)
            isFeatured: server[9],    // Featured server flag
            isEnabled: server[10],       // Enabled server flag (replaces active)
            registrationTime: server[11],

        }
        serversData.push(newServer)
    }

    const data = serializeData(serversData)

    return Response.json({data})
}
