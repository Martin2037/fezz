import ky from 'ky';

/**
 * 向ByteHunter API发送交易分析请求
 * @param {Object} params - 请求参数
 * @param {string} params.chain_id - 区块链ID
 * @param {number} params.record - 记录标识
 * @param {string} params.transaction_hash - 交易哈希
 * @param {string} params.user_address - 用户地址
 * @returns {Promise<Object>} - 返回API响应数据
 */
export async function analyzeTransaction({
  chain_id,
  record = 1,
  transaction_hash,
  user_address = "0x96c8064708694e4a9f620fa0ab79e2b5dfe4bd24"
}) {
  const url = 'https://backend.bytehunter.site/web3/v1/public/analysisTxInfo';
  
  try {
    const response = await ky.post(url, {
      json: {
        chain_id,
        record,
        transaction_hash,
        user_address
      },
      timeout: 30000, // 30秒超时
      retry: {
        limit: 2,
        methods: ['post'],
      }
    }).json();
    
    return response;
  } catch (error) {
    console.error('分析交易请求失败:', error);
    throw new Error(`ByteHunter API请求失败: ${error.message}`);
  }
}

/**
 * 示例用法
 * const result = await analyzeTransaction({
 *   chain_id: "8453",
 *   record: 1,
 *   transaction_hash: "0x3e538b96aeb284637f0ea60248c54bd039c313ae4cc9ee0769b064de3b075b07",
 *   user_address: "0x96c8064708694e4a9f620fa0ab79e2b5dfe4bd24"
 * });
 */
