import ky from 'ky';

export async function TokenSecurity(chain_id, contract_addresses) {
    const response = await ky.get(`https://api.gopluslabs.io/api/v1/token_security/${chain_id}?contract_addresses=${contract_addresses}`, {
        headers: {
            'accept': '*/*'
        }
    });
    const data = await response.json();
    return data;
}

export async function AddressSecurity(address) {
    try {
        const response = await ky.get(`https://api.gopluslabs.io/api/v1/address_security/${address}`, {
            headers: {
                'accept': '*/*'
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取地址安全信息失败:', error);
        return { code: 0, message: error.message };
    }
}

export async function PhishingSiteDetect(url) {
    try {
        // 确保URL编码
        const encodedUrl = encodeURIComponent(url);
        const response = await ky.get(`https://api.gopluslabs.io/api/v1/phishing_site?url=${encodedUrl}`, {
            headers: {
                'accept': '*/*'
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('检测钓鱼网站失败:', error);
        return { code: 0, message: error.message };
    }
}