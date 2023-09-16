import { AccountStatus } from "../../common/constant";
import * as db from "../db";
import { Wallet, getBytes, isHexString, toUtf8Bytes } from "ethers";
import { getProvider } from "./chain";
import { decryptKeys, encryptKeys } from "../../utils/crypto";

export const account_unlocked = async () => {
    const pw = await db.getPassword()
    return !!pw
}

export const accounts_online = async () => {
    return await db.getAddresses({ status: AccountStatus.Online })
}

export const accounts_all = async () => {
    return await db.getAddresses()
}

export const account_imported = async () => {
    const wallets = await db.getKeysCipher()
    return !!wallets.length
}

export const create_accounts = async (addresses) => {
    await db.putAddresses(addresses)
}

export const unlock_account = async (password) => {
    const cipher = await db.getKeysCipher()
    if (!cipher) {
        throw new Error("no account")
    }

    const keys = decryptKeys(cipher, password)
    for (const key of keys) {
        const w = new Wallet(key)
        await db.cacheKey(w.address, key)
    }

    await db.setPassword(password)
}

export const lock_account = async () => {
    await db.clearSession()
}

export const import_account = async (params) => {
    const password = params.password || await db.getPassword()
    if (!password || !params.keys) {
        throw new Error("unsupported parmas")
    }

    let keys = []
    let newAddrs = []
    const newKeys = params.keys.trim().split(/\s+/)
    try {
        const preCipher = await db.getKeysCipher()
        if (preCipher) {
            keys = decryptKeys(preCipher, password)
        }

        for (const key of newKeys) {
            if (!keys.includes(key)) {
                const w = new Wallet(key)
                newAddrs.push(w.address)
            }
        }

        keys = keys.concat(newKeys)
    } catch (error) {
        throw new Error("格式或密码错误")
    }

    const ciphertext = encryptKeys(keys, password)
    await db.addKeys(ciphertext)
    await create_accounts(newAddrs)
    await unlock_account(password)
}

export const delete_account = async (addresses) => {
    if (addresses.length == 0) { return }

    const password = await db.getPassword()
    if (!password) { throw new Error("Please login") }

    const preCipher = await db.getKeysCipher()
    let keys = decryptKeys(preCipher, password)

    const cacheKeys = await db.getCacheKeys(addresses)
    const deleteKeys = Object.values(cacheKeys)

    keys = keys.filter(key => !deleteKeys.includes(key))

    const ciphertext = encryptKeys(keys, password)
    await db.addKeys(ciphertext)
    await db.removeKeys(addresses)
    await db.removeAddresses(addresses)
}

export const update_account = async (params) => {
    const changed = []
    for (const address of params.addresses) {
        changed.push({
            key: address,
            changes: params.changes
        })
    }
    await db.updateAddresses(changed)
}

export const send_tx_by_account = async (params, sender) => {
    const signer = await getProviderSigner(params[0].from, sender)
    const unSignedTx = await signer.populateTransaction(params[0])
    const tx = await signer.sendTransaction(unSignedTx)
    return tx
}

export const sign_message = async (params, sender) => {
    const signer = await getSigner(params[1])
    let message = params[0]
    if (isHexString(message)) {
        message = getBytes(message)
    }
    const signed = await signer.signMessage(message)
    return signed
}

const getSigner = async (address) => {
    const key = await db.getCacheKey(address)
    return new Wallet(key)
}

const getProviderSigner = async (address, sender) => {
    const w = await getSigner(address)
    const provider = await getProvider(sender)
    const signer = w.connect(provider)
    return signer
}


