import { addressKey, isAddressKey, getAddressFromKey } from "../../utils"

export const setPassword = async (password) => {
    await chrome.storage.session.set({ 'password': password })
}

export const getPassword = async () => {
    const res = await chrome.storage.session.get(['password'])
    return res['password']
}

export const cacheKey = async (address, key) => {
    const addr = address.toLowerCase()
    const data = {}
    data[addressKey(addr)] = key
    await chrome.storage.session.set(data)
}

export const removeKeys = async (addresses) => {
    const keys = []
    for (const address of addresses) {
        const addr = address.toLowerCase()
        keys.push(addressKey(addr))

    }
    await chrome.storage.session.remove(keys)
}

export const getCacheKey = async (addr) => {
    const address = addr.toLowerCase()
    const key = addressKey(address)
    const res = await chrome.storage.session.get([key])
    return res[key]
}

export const getCacheKeys = async (addresses) => {
    const keys = []
    for (const address of addresses) {
        const addr = address.toLowerCase()
        keys.push(addressKey(addr))
    }
    return await chrome.storage.session.get(keys)
}

export const getTabs = async () => {
    const res = await chrome.storage.session.get(['tabs'])
    return res['tabs'] || []
}

export const setTabs = async (tabs) => {
    await chrome.storage.session.set({ 'tabs': tabs })
}

export const clearSession = async () => {
    await chrome.storage.session.clear()
}