export const mcpServers = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Decentralized trading protocol that uses automated market-making (AMM) model to facilitate cryptocurrency token trading through MCP server.',
    provider: 'uniswap',
    providerName: 'Uniswap Labs',
    tags: ['defi', 'exchange', 'swap'],
    url: 'mcp://uniswap.mcp.dev',
    localUrl: '/api/mcp/sse/uniswap',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/uniswap.svg'
  },
  {
    id: 'goplus',
    name: 'GoPlus',
    description: 'Blockchain security solution provider offering real-time security detection and risk alerts for MCP services with comprehensive protection layers.',
    provider: 'goplus',
    providerName: 'GoPlus Security',
    tags: ['security', 'blockchain', 'risk-detection'],
    url: 'mcp://goplus.mcp.dev',
    localUrl: '/api/mcp/sse/goplus',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/goplus.svg'
  },
  {
    id: 'moralis',
    name: 'Moralis',
    description: 'MCP server providing blockchain data indexing and API access, simplifying Web3 development workflows with comprehensive tooling and infrastructure.',
    provider: 'moralis',
    providerName: 'Moralis',
    tags: ['web3', 'api', 'blockchain-data'],
    url: 'mcp://moralis.mcp.dev',
    localUrl: '/api/mcp/sse/moralis',
    isFeatured: true,
    isEnabled: false,
    logo: '/logo/moralis.svg'
  },
  {
    id: 'bytehunter',
    name: 'ByteHunter',
    description: 'Smart contract audit and vulnerability scanning service MCP interface, providing automated security analysis for blockchain developers and projects.',
    provider: 'bytehunter',
    providerName: 'ByteHunter Security',
    tags: ['smart-contract', 'audit', 'security'],
    url: 'mcp://bytehunter.mcp.dev',
    localUrl: '/api/mcp/sse/bytehunter',
    isFeatured: true,
    isEnabled: true,
    logo: '/logo/bytehunter.png'
  },
];
