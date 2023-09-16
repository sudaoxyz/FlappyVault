import Dexie from 'dexie';

const schemas = {
    address: '++id,address, balance, status',
    chain: 'chain_name, chain_id, status, currency_name, currency_symbol, currency_decimals, rpc_url, explorer_url, icon_url',
    whitelist: 'name, chain_id, url, target, method, status, single_limit, total_limit, current_sum',
    setting: "id, current_chain"
}

const db = new Dexie('supperwallet')
db.version(1).stores(schemas)

export { db }