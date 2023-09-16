export const getKeysCipher = async () => {
    const res = await chrome.storage.local.get(['keysCipher'])
    return res['keysCipher'] || ''
}

export const addKeys = async (cipherText) => {
    await chrome.storage.local.set({ keysCipher: cipherText })
}

export const listLocal = async () => {
    const res = await chrome.storage.local.get()
    for (const key in res) {
        console.log(`[${key}: ${res[key]}]`)
    }
}