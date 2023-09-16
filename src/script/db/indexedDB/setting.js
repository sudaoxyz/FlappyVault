import { db } from './schema'

export const initSetting = async (chainName) => {
    const setting = { id: 1, current_chain: chainName }
    await db.setting.put(setting)
}

export const getSetting = async () => {
    return await db.setting.toCollection().last()
}

export const putSetting = async (setting) => {
    return await db.setting.put(setting)
}

export const updateSetting = async (key, changed) => {
    await db.setting.update(key, changed)
}