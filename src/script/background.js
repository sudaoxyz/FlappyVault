// const data = {
//     id: 0,
//     target:'',
//     to: 0,
//     from: 0,
//     type:"req\resp"
//     taskId:0,
//     name: "boternet-provider",
//     method: "",
//     params: "",
//     result: "",
//     err:"",
//     return: true
// }
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("11111111", msg)
    if (msg && msg.to) {
        msg.from = sender.tab.id
        chrome.tabs.sendMessage(Number(msg.to), msg)
        return false
    } else {
        msg.type = 'resp'
        const method = service[msg.method]
        if (!method) {
            msg.err = new Error("unsupported method")
            sendResponse(msg)
        } else {
            method(msg, sender).then((resp) => {
                msg.result = resp
                sendResponse(msg)
            }).catch(err => {
                msg.err = err
                sendResponse(msg)
            })
        }

        return true
    }
})

const service = {
    getTabId: async (msg, sender) => {
        return sender.tab.id
    },
    open_page: async (msg, sender) => {
        const params = msg.params
        console.log('open_page', params)

        const tab = await chrome.tabs.create({})
        const data = {}
        data[tab.id] = {
            type: "boter",
            controller: sender.tab.id,
            taskId: params.taskId,
            provider: params.provider
        }

        await chrome.storage.local.set(data)
        await chrome.tabs.update(tab.id, { url: params.url })

        return { boterId: tab.id, boternet: sender.tab.id }
    },

    attach: async (msg, sender) => {
        await chrome.debugger.attach({ tabId: sender.tab.id }, '1.3')
    },
    detach: async (msg, sender) => {
        await chrome.debugger.detach({ tabId: sender.tab.id })
    },
    focus: async (msg, sender) => {
        const params = msg.params
        const options = { type: 'mousePressed', x: params.x, y: params.y, button: 'left', clickCount: 3 }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", options)
    },
    click: async (msg, sender) => {
        const params = msg.params
        const mouseDown = { type: 'mousePressed', x: params.x, y: params.y, button: 'left', clickCount: 1 }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseDown)
        const mouseUp = { type: 'mouseReleased', x: params.x, y: params.y, button: 'left' }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseUp)
    },
    input: async (msg, sender) => {
        const params = msg.params
        for (const c of params.text) {
            const options = { type: 'keyDown', text: c, isKeypad: true }
            await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchKeyEvent", options)
        }
    },
    scroll_page: async (msg, sender) => {
        const params = msg.params
        const option = { type: 'mouseWheel', x: params.x + 1, y: params.y + 1, deltaX: params.deltaX, deltaY: params.deltaY }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", option)
    },
    fetchJson: async (msg, sender) => {
        const params = msg.params
        const resp = await fetch(params.url, params.options)
        return resp.json()
    }
}