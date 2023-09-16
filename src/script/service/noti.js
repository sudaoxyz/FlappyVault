const notiPath = "src/ui/notification/index.html"
const popupPath = "src/ui/popup/index.html"

const notifyMap = {}
let isPopup = false

export const confirm_noti = async (params) => {
    const notify = notifyMap[params.id]
    if (!notify) { return }

    notify.resolve(params.data)
    delete notifyMap[params.id]
    await removeAndResetPopup(notify)
    isPopup = false

    const nextNotify = await getNextNotify()
    if (nextNotify) {
        const popupId = await notifyPopup(nextNotify.id)
        notifyMap[nextNotify.id].popupId = popupId
    }
}

export const noti_msg = async (id) => {
    return {
        tabId: notifyMap[id].id,
        title: notifyMap[id].title,
        url: notifyMap[id].url,
        msg: notifyMap[id].msg
    }
}

export const show_badge = async (msg) => {
    if (msg.value.method == "eth_requestAccounts") {
        await chrome.action.setBadgeTextColor({ color: "#FFFF00" })
    } else if (msg.value.method == 'eth_sendTransaction') {
        await chrome.action.setBadgeTextColor({ color: "#FF0000" })
    } else {
        await chrome.action.setBadgeTextColor({ color: "#00FF00" })
    }
    await chrome.action.setBadgeText({ text: "1" })
}

export const reset_badge = async () => {
    let notifyNum = 0
    for (const k in notifyMap) {
        notifyNum++
    }

    await chrome.action.setBadgeText({ text: notifyNum ? notifyNum.toString() : '' })
}

export const show_noti = async (msg, sender) => {
    const id = Math.floor((1 + Math.random()) * 10000000)
    const popupId = await notifyPopup(id)
    return await requestConfim(id, msg, popupId, sender)
}

export const show_login = async () => {
    await chrome.action.setBadgeText({ text: "解锁" })
}

async function requestConfim(id, msg, popupId, sender) {
    const tab = sender.tab || {}
    return new Promise(resolve => {
        notifyMap[id] = {
            id, resolve, popupId,
            msg: msg.value,
            tabId: tab.id,
            title: tab.title,
            url: tab.url
        }
    })
}

async function getNextNotify() {
    await clearNotify()

    for (const id in notifyMap) {
        return notifyMap[id]
    }
}

async function notifyPopup(id) {
    if (isPopup) { return 0 }
    isPopup = true
    await chrome.action.setPopup({ popup: notiPath + `?notiid=${id}` })
    const url = chrome.runtime.getURL(notiPath) + `?notiid=${id}`
    return await createPopup(url)
}

async function createPopup(url) {
    const window = await chrome.windows.getCurrent({ windowTypes: ["normal"] })
    const currentPopup = await chrome.windows.create({
        url: url, type: 'popup', width: 650, height: 487,
        left: Math.round(window.width - 650),
    })
    return currentPopup.id
}

async function removeAndResetPopup(notify) {
    await chrome.action.setPopup({ popup: popupPath })
    const windows = await chrome.windows.getAll({ windowTypes: ["popup"] })
    const popup = windows.find(window => window && window.id === notify.popupId)
    if (popup) {
        await chrome.windows.remove(notify.popupId)
    }
}
async function clearNotify() {
    const notifyObj = Object.assign({}, notifyMap)
    const pages = await chrome.windows.getAll({ populate: true, windowTypes: ["normal"] })
    const currentTabIds = pages[0].tabs.map(tab => tab.id)

    for (const id in notifyObj) {
        if (!currentTabIds.includes(notifyObj[id].tabId)) {
            delete notifyMap[notifyObj[id].id]
        }
    }
}