import { WhiteListStatus } from '../../../common/constant'
import { db } from './schema'

export const getWhiteList = async (where) => {
    if (where) {
        return await db.whitelist.where(where).toArray()
    }
    return await db.whitelist.toArray()
}

export const getOpenWhiteListByUrl = async (url) => {
    return await db.whitelist.where({ url: url, status: WhiteListStatus.Open }).toArray()
}

export const putWhiteList = async (item) => {
    return await db.whitelist.put(item)
}

export const updateWhiteList = async (changes) => {
    await db.transaction('rw', db.whitelist, async () => {
        for (const change of changes) {
            await db.whitelist.update(change.key, change.changes)
        }
    })
}

export const deleteWhiteList = async (name) => {
    await db.whitelist.delete(name)
}