import { AccountStatus } from '../../../common/constant'
import { db } from './schema'

export const putAddresses = async (addresses) => {
    const data = addresses.map(address => {
        return { address: address.toLowerCase(), status: AccountStatus.Offline }
    })
    return await db.address.bulkPut(data)
}

export const getAddresses = async (where) => {
    if (where) {
        if (where.address) {
            where.address = where.address.toLowerCase()
        }
        return await db.address.where(where).toArray()
    }
    return await db.address.toArray()
}

export const updateAddresses = async (changes) => {
    await db.transaction('rw', db.address, async () => {
        for (const change of changes) {
            await db.address.where({ address: change.key }).modify(change.changes)
        }
    })
}

export const removeAddresses = async (addresses) => {
    await db.transaction('rw', db.address, async () => {
        await db.address.where('address').anyOfIgnoreCase(addresses).delete()
    })
}