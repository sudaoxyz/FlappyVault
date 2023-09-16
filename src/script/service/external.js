// 供dapp的访问的 eip1193 请求
import { toQuantity } from "ethers";
import { accounts_online, send_tx_by_account, sign_message } from "./account";
import { getProvider, setProvider } from "./chain";
import { putChain } from "../db";

export const eth_gasPrice = async (params, sender) => {
    const provider = await getProvider(sender)
    const feeData = await provider.getFeeData()
    return feeData.gasPrice.toString(10)
}

export const eth_requestAccounts = async (params, sender) => {
    const result = [];
    const accounts = await accounts_online()
    for (const account of accounts) {
        result.push(account.address)
    }
    return result;
}

export const eth_coinbase = async (params, sender) => {
    return await eth_requestAccounts(params, sender)
}

export const eth_accounts = async (params, sender) => {
    return await eth_requestAccounts(params, sender)
}

export const eth_blockNumber = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getBlockNumber()
}

export const eth_chainId = async (params, sender) => {
    const provider = await getProvider(sender)
    const result = await provider.getNetwork();
    return toQuantity(result.chainId);
}

export const eth_getBalance = async (params, sender) => {
    const provider = await getProvider(sender)
    const result = await provider.getBalance(params[0], params[1]);
    return toQuantity(result);
}

//todo
export const eth_getStorageAt = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getStorageAt(params[0], params[1], params[2]);
}

export const eth_getTransactionCount = async (params, sender) => {
    const provider = await getProvider(sender)
    const result = await provider.getTransactionCount(params[0], params[1]);
    return toQuantity(result);
}

export const eth_getBlockTransactionCountByHash = async (params, sender) => {
    const provider = await getProvider(sender)
    const result = await provider.getBlock(params[0]);
    return toQuantity(result.transactions.length);
}
export const eth_getBlockTransactionCountByNumber = async (params, sender) => {
    return await eth_getBlockTransactionCountByHash(params, sender)
}


export const eth_getCode = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getCode(...params)
}

export const eth_sendRawTransaction = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.broadcastTransaction(params[0]);
}

export const eth_sendTransaction = async (params, sender) => {
    const tx = await send_tx_by_account(params, sender)
    return tx.hash
}

export const eth_call = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.call(params[0], params[1]);
}
export const eth_estimateGas = async (params, sender) => {
    const provider = await getProvider(sender)
    if (params[1] && params[1] !== "latest") {
        throw Error("estimateGas does not support blockTag", { method: method, params: params })
    }

    const result = await provider.estimateGas(params[0]);
    return toQuantity(result);
}
export const eth_getBlockByHash = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getBlock(...params)
}
export const eth_getBlockByNumber = async (params, sender) => {
    return await eth_getBlockByHash(params, sender)
}


export const eth_getTransactionByHash = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getTransaction(params[0])
}
export const eth_getTransactionReceipt = async (params, sender) => {
    const provider = await getProvider(sender)
    return await provider.getTransactionReceipt(params[0]);
}

export const eth_sign = async (params, sender) => {
    return
}

export const personal_sign = async (params, sender) => {
    return await sign_message(params, sender)
}

export const wallet_switchEthereumChain = async (params, sender) => {
    const tabId = sender.tab ? sender.tab.id : undefined
    await setProvider({ chainId: params[0].chainId, tabId: tabId })
}

export const wallet_addEthereumChain = async (params, sender) => {
    const info = params[0]
    const chain = {
        chain_name: info.chainName,
        chain_id: info.chainId,
        currency_name: info.nativeCurrency.name,
        currency_symbol: info.nativeCurrency.symbol,
        currency_decimals: info.nativeCurrency.decimals,
        rpc_url: info.rpcUrls[0],
        explorer_url: info.blockExplorerUrls[0]
    }
    await putChain(chain)
}

export const metamask_getProviderState = async (params, sender) => {
    const chainId = await eth_chainId(params, sender)
    const accounts = await eth_requestAccounts(params, sender)
    return {
        isUnlocked: true,
        chainId: chainId,
        networkVersion: chainId,
        accounts: accounts
    }
}

export const metamask_sendDomainMetadata = async (params, sender) => {
    // params = {
    //     "name": "Uniswap Interface",
    //     "icon": "https://app.uniswap.org/favicon.png"
    // }
}

export const net_listening = async (params, sender) => {

}

export const net_version = async (params, sender) => {
    return await eth_chainId(params, sender)
}