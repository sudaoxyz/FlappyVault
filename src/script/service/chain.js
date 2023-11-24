import { ethers, toQuantity } from "ethers";
import { get_tab_chain, set_tab_chain } from "./whitelist";
import * as db from "../db";

let provider = null;

export const initChainData = async () => {
    await db.initChains()
    await db.initSetting(db.Scroll.chain_name)
}

export const getProvider = async (sender) => {
    if (sender.tab && sender.tab.id) {
        const chainName = await get_tab_chain(sender.tab.id)
        const chain = await db.getChainByChainName(chainName)
        if (chain && chain.rpc_url) {
            return new ethers.JsonRpcProvider(chain.rpc_url)
        }
    }

    if (provider) {
        return provider
    }
    const setting = await db.getSetting()
    const chain = await db.getChainByChainName(setting.current_chain)
    provider = new ethers.JsonRpcProvider(chain.rpc_url)
    return provider
}

export const getProviderByChainId = async (chainId) => {
    const chain = await db.getChainByChainId(toQuantity(chainId))
    return new ethers.JsonRpcProvider(chain.rpc_url)
}

export const setProvider = async ({ chainId, tabId }) => {
    console.log('setProvider', tabId)
    const setting = await db.getSetting()
    const chain = await db.getChainByChainId(toQuantity(chainId))

    if (!chain || !chain.chain_name) {
        throw new Error(`unknown chain of chainId(${chainId})`)
    }

    if (tabId) {
        await set_tab_chain({ tabId: tabId, chainName: chain.chain_name })
    } else {
        await db.updateSetting(setting.id, { current_chain: chain.chain_name })
        provider = new ethers.JsonRpcProvider(chain.rpc_url)
    }
}

export const setProviderByName = async ({ chainName, tabId }) => {
    console.log('setProviderByName', chainName, tabId)
    const setting = await db.getSetting()
    const chain = await db.getChainByChainName(chainName)

    if (!chain || !chain.chain_name) {
        throw new Error(`unknown chain of chain name(${chainName})`)
    }

    if (tabId) {
        await set_tab_chain({ tabId: tabId, chainName: chain.chain_name })
    } else {
        await db.updateSetting(setting.id, { current_chain: chain.chain_name })
        provider = new ethers.JsonRpcProvider(chain.rpc_url)
    }
}

export const chain_info = async () => {
    const setting = await db.getSetting()
    return await db.getChainByChainName(setting.current_chain)
}

export const add_chain = async (chain) => {
    await db.putChain(chain)
}

export const delete_chain = async (chainName) => {
    await db.deleteChain(chainName)

    const setting = await db.getSetting()
    if (chainName != setting.current_chain) {
        return
    }

    const chains = await db.getChains()
    if (chains.length > 0) {
        await db.updateSetting(setting.id, { current_chain: chains[0].chain_name })
    }
}

export const chain_list = async () => {
    const setting = await db.getSetting()

    const res = []
    const chains = await db.getChains()
    for (const chain of chains) {
        res.push({ name: chain.chain_name, id: chain.chain_id, isCurrent: chain.chain_name == setting.current_chain })
    }
    return res
}