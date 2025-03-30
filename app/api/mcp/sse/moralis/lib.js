import ky from 'ky';

/**
 * 获取热门代币列表
 * @param {string} chain - 区块链网络，如 'bsc', 'eth', 'polygon' 等
 * @returns {Promise<Object>} - 返回热门代币数据
 */
export async function getTrendingTokens(chain = 'bsc') {
    try {
        const response = await ky.get(`https://deep-index.moralis.io/api/v2.2/tokens/trending`, {
            searchParams: {
                chain: chain,
                limit: 10
            },
            headers: {
                'accept': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取热门代币失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 搜索代币
 * @param {string} query - 搜索关键词
 * @param {string[]} chains - 区块链网络数组，如 ['eth', 'bsc', 'base'] 等
 * @param {number} limit - 返回结果数量限制
 * @returns {Promise<Object>} - 返回搜索到的代币数据
 */
export async function searchTokens(query, chains = ['eth', 'bsc', 'base'], limit = 10) {
    try {
        const chainsStr = Array.isArray(chains) ? chains.join(',') : chains;
        
        const response = await ky.get(`https://deep-index.moralis.io/api/v2.2/tokens/search`, {
            searchParams: {
                query: query,
                chains: chainsStr,
                limit: limit
            },
            headers: {
                'accept': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('搜索代币失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取多个ERC20代币的元数据
 * @param {string[]} addresses - 代币合约地址数组
 * @param {string} chain - 区块链网络，如 'eth', 'bsc', 'polygon', 'base' 等
 * @returns {Promise<Object>} - 返回多个代币的元数据
 */
export async function getTokensMetadata(addresses, chain = 'eth') {
    try {
        // 构建查询参数
        const searchParams = new URLSearchParams();
        searchParams.append('chain', chain);
        
        // 添加多个地址参数
        addresses.forEach((address, index) => {
            searchParams.append(`addresses[${index}]`, address);
        });
        
        const response = await ky.get(`https://deep-index.moralis.io/api/v2.2/erc20/metadata`, {
            searchParams,
            headers: {
                'accept': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取代币元数据失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取钱包盈亏情况摘要
 * @param {string} address - 钱包地址
 * @param {string} chain - 区块链网络，如 'eth', 'bsc', 'polygon' 等
 * @returns {Promise<Object>} - 返回钱包盈亏数据
 */
export async function getWalletPnlSummary(address, chain = 'eth') {
    try {
        const response = await ky.get(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/profitability/summary`, {
            searchParams: {
                chain: chain
            },
            headers: {
                'accept': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取钱包盈亏数据失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取钱包所有代币列表
 * @param {string} address - 钱包地址
 * @param {string} chain - 区块链网络，如 'eth', 'bsc', 'polygon', 'base' 等
 * @param {number} limit - 结果数量限制
 * @returns {Promise<Object>} - 返回钱包代币数据
 */
export async function getWalletTokens(address, chain = 'eth', limit = 100) {
    try {
        const response = await ky.get(`https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens`, {
            searchParams: {
                chain: chain,
                limit: limit
            },
            headers: {
                'accept': 'application/json',
                'X-API-Key': process.env.MORALIS_API_KEY
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取钱包代币列表失败:', error);
        return { success: false, error: error.message };
    }
}
