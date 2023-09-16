import { Role } from "./constant"

export const wrapMetaMask = (id, result) => {
    return {
        target: Role.INPAGE,
        data: {
            name: Role.PROVIDER,
            data: {
                jsonrpc: '2.0',
                id: id,
                result: result
            }
        }
    }
}

export const wrap = (from, to, id, value, err) => {
    return {
        from: from,
        to: to,
        id: id,
        value: value,
        err: err
    }
}

// 封装请求

//anyMsg 通常用于sendResponse
export const anyMsg = (id, value) => {
    return wrap(null, null, id, value)
}

export const anyErr = (id, error) => {
    return wrap(null, null, id, null, error)
}

export const c2bMsg = (id, value) => {
    return wrap(Role.Content, Role.Background, id, value)
}

export const b2iMsg = (id, value) => {
    return wrap(Role.Background, Role.Inpage, id, value)
}

export const p2iMsg = (id, value) => {
    return wrap(Role.Popup, Role.Inpage, id, value)
}

export const p2bMsg = (method, params) => {
    const value = { method: method, params: params }
    return wrap(Role.Popup, Role.Background, 0, value)
}

export const b2cMsg = (method, params) => {
    const value = { method: method, params: params }
    return wrap(Role.Background, Role.Content, 0, value)
}

// 过滤请求
export const isb2c = (msg) => {
    if (!msg) { return false }
    return msg.from == Role.Background && msg.to == Role.Content
}

export const isb2i = (msg) => {
    if (!msg) { return false }
    return msg.from == Role.Background && msg.to == Role.Inpage
}

export const isc2b = (msg) => {
    if (!msg) { return false }
    return msg.from == Role.Content && msg.to == Role.Background
}

export const isp2b = (msg) => {
    if (!msg) { return false }
    return msg.from == Role.Popup && msg.to == Role.Background
}