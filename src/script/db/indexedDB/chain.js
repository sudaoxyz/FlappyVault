import { db } from './schema'

export const initChains = async () => {
    await db.chain.bulkPut([Mainnet, zkSync, Goerli, scrollTestnet, zkSyncTestnet, Arbitrum, Linea, PolygonEvm, Base, Bsc, Optimism, Matic, Fantom])
}

export const getChains = async () => {
    return await db.chain.toArray()
}

export const getChainByChainId = async (chainId) => {
    return await db.chain.where({ chain_id: chainId }).first()
}

export const getChainByChainName = async (chainName) => {
    return await db.chain.where({ chain_name: chainName }).first()
}

export const putChain = async (chain) => {
    return await db.chain.put(chain)
}

export const deleteChain = async (chainName) => {
    await db.chain.delete(chainName)
}

export const Mainnet = {
    chain_name: "Ethereum Mainnet",
    chain_id: "0x1",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://mainnet.infura.io/v3",
    explorer_url: "https://etherscan.io"
}

export const Goerli = {
    chain_name: "Goerli",
    chain_id: "0x5",
    currency_name: "Goerli Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://rpc.ankr.com/eth_goerli",
    explorer_url: "https://goerli.etherscan.io"
}

export const scrollTestnet = {
    chain_name: "Scroll Testnet",
    chain_id: "0x82751",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://alpha-rpc.scroll.io/l2",
    explorer_url: "https://blockscout.scroll.io"
}

export const zkSync = {
    chain_name: "zkSync Era",
    chain_id: "0x144",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://mainnet.era.zksync.io",
    explorer_url: "https://explorer.zksync.io"
}

export const zkSyncTestnet = {
    chain_name: "zkSync Era Testnet",
    chain_id: "0x118",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://testnet.era.zksync.dev",
    explorer_url: "https://goerli.explorer.zksync.io"
}

export const Arbitrum = {
    chain_name: "Arbitrum",
    chain_id: "0xa4b1",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://arb1.arbitrum.io/rpc",
    explorer_url: ""
}

export const Linea = {
    chain_name: "Linea",
    chain_id: "0xe708",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://rpc.linea.build",
    explorer_url: ""
}

export const PolygonEvm = {
    chain_name: "Polygon evm",
    chain_id: "0x44d",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://zkevm-rpc.com",
    explorer_url: ""
}

export const Base = {
    chain_name: "Base",
    chain_id: "0x2105",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://developer-access-mainnet.base.org",
    explorer_url: ""
}

export const Bsc = {
    chain_name: "BSC",
    chain_id: "0x38",
    currency_name: "BNB",
    currency_symbol: "BNB",
    currency_decimals: 18,
    rpc_url: "https://bsc-dataseed1.binance.org",
    explorer_url: ""
}

export const Optimism = {
    chain_name: "Optimism",
    chain_id: "0xa",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://mainnet.optimism.io",
    explorer_url: ""
}

export const Matic = {
    chain_name: "Matic",
    chain_id: "0x89",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://polygon-rpc.com",
    explorer_url: ""
}

export const Avax = {
    chain_name: "Avax",
    chain_id: "0xa86a",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://api.avax.network/ext/bc/C/rpc",
    explorer_url: ""
}

export const Fantom = {
    chain_name: "Fantom",
    chain_id: "0xfa",
    currency_name: "Ether",
    currency_symbol: "ETH",
    currency_decimals: 18,
    rpc_url: "https://rpcapi.fantom.network",
    explorer_url: ""
}