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