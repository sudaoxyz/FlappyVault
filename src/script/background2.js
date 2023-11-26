import * as service from "./service"
import { withMiddlewares } from "./middleware"
import { isc2b, isp2b, isIframeContentToParent, isParentToIframePage, isParentToIframeContent, anyMsg, anyErr } from "../common/wrap"
import { checkConfirm } from "./middleware/confirm"

// chrome.storage.local.clear()
chrome.action.setPopup({ popup: "src/ui/popup/index.html" })

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!isc2b(msg) && !isp2b(msg) && !isIframeContentToParent(msg) && !isParentToIframePage(msg) && !isParentToIframeContent(msg)) { return false }

    let middlewares = [];
    if (isc2b(msg)) {
        middlewares = [checkConfirm]
    }

    withMiddlewares(msg, sender, sendResponse, excute, middlewares).catch(error => {
        console.log("background middlewares: ", error, msg)
    })

    return true
})

chrome.runtime.onInstalled.addListener(() => {
    service.initChainData().then(() => {
        console.log("chain setting inited")
    })
})

const excute = async (msg, sender, sendResponse) => {
    let method = null
    console.log("|||||||||| - excute excute msg", msg)
    if (isIframeContentToParent(msg)) {
        console.log("3333333333333333 - excute isIframeContentToParent req", msg)
        const resp = await chrome.tabs.sendMessage(Number(msg.value.boternet), msg)
        console.log("77777777777777 - excute isIframeContentToParent resp", resp)
        return sendResponse(resp)
    } else if (isParentToIframePage(msg)) {
        console.log("ddddddddddddddd - excute isParentToIframePage req", msg)
        const resp = await chrome.tabs.sendMessage(Number(msg.boterId), msg)
        console.log("eeeeeeeeeeeeee - excute isParentToIframePage resp", resp)
        return sendResponse(resp)
    } else if (isParentToIframeContent(msg)) {
        console.log("contentddddddddddddddd - excute isParentToIframecontent req", msg)
        const resp = await chrome.tabs.sendMessage(Number(msg.value.boterId), msg)
        console.log("contenteeeeeeeeeeeeee - excute isParentToIframecontent resp", resp)
        return sendResponse(resp)
    } else if (isc2b(msg)) {
        method = service.external[msg.value.method] || service.command[msg.value.method]
    } else {
        method = service[msg.value.method]
    }

    if (!method) {
        return sendResponse(anyErr(msg.id, new Error("unsupported method")))
    }

    try {
        const resp = await method(msg.value.params, sender)
        console.log("excute resp", msg, resp)
        formatLog(msg, resp, null)
        sendResponse(anyMsg(msg.id, resp))
    } catch (error) {
        formatLog(msg, null, error)
        sendResponse(anyErr(msg.id, error))
    }
}

const formatLog = (msg, resp, error) => {
    console.log('%s(%s) return %s [%s] | %s->%s',
        msg.value.method,
        msg.value.params ? JSON.stringify(msg.value.params) : '',
        resp === '' ? resp : JSON.stringify(resp),
        error ? `error:${error}` : 'success',
        msg.from.substring('sw-'.length),
        msg.to.substring('sw-'.length))
}