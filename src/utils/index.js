export * from './address'

export const sleep = (value = 30) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, value)
    })
}