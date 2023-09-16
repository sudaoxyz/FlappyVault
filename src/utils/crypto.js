import CryptoJS from "crypto-js"

const separator = ','
export const encryptKeys = (keys, pw) => {
    return CryptoJS.AES.encrypt(keys.join(separator), pw).toString()
}
export const decryptKeys = (ciphertext, pw) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, pw);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text.split(separator)
}