async function addTimerListener(port) {
    const result = await chrome.storage.session.get(["connectedPorts"])
    const data = result["connectedPorts"] || {}
    if (!data[port.sender.tab.id]) {
        data[port.sender.tab.id] = true
        await chrome.storage.session.set({ connectedPorts: data })
    }
}
async function clearTimerListener(port) {
    const result = await chrome.storage.session.get(["connectedPorts"])
    let data = result["connectedPorts"] || {}
    delete data[port.sender.tab.id]
    await chrome.storage.session.set({ connectedPorts: data })
}

chrome.runtime.onConnect.addListener((port) => {
    console.log("onConnect:", port)
    addTimerListener(port)
    port.onDisconnect.addListener((port) => {
        console.log("onDisconnect: ", port)
        clearTimerListener(port)
    })
})

chrome.alarms.onAlarm.addListener((alarms) => {
    console.log("onAlarm", alarms)
    for (let i = 0; i < 30; i++) {
        setTimeout(async () => {
            const result = await chrome.storage.session.get(["connectedPorts"])
            const data = result["connectedPorts"] || {}
            Object.keys(data).forEach(tabId => {
                chrome.tabs.sendMessage(Number(tabId), {
                    target: 'inpage',
                    type: "req",
                    jobId: 0,
                    name: "boternet-provider",
                    method: "request_interval"
                })
            })
        }, i * 1000)
    }
})

chrome.alarms.create("timer", { delayInMinutes: 0.5, periodInMinutes: 0.5 })

chrome.action.setPopup({ popup: "src/ui/popup/index.html" })

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.to) {
        msg.from = sender.tab.id
        chrome.tabs.sendMessage(Number(msg.to), msg)
        sendResponse()
    } else {
        const method = service[msg.method]
        if (!method) {
            sendResponse({ err: "unsupported method" })
        } else {
            method(msg, sender).then((resp) => {
                sendResponse({ data: resp })
            }).catch(err => {
                sendResponse({ err: err })
            })
        }
    }
    return true
})

const service = {
    getTabId: async (msg, sender) => {
        return sender.tab.id
    },
    new_page: async (msg, sender) => {
        const params = msg.params

        const tab = await chrome.tabs.create({})
        const data = {}
        data[tab.id] = {
            type: "boter",
            boter: tab.id,
            controller: sender.tab.id,
            jobId: params.jobId,
            provider: params.provider
        }

        await chrome.storage.local.set(data)

        return { boterId: tab.id, boternet: sender.tab.id }
    },
    update_page: async (msg, sender) => {
        const params = msg.params
        await chrome.tabs.update(params.tabId, { url: params.url })
    },
    reload_page: async (sender) => {
        await chrome.tabs.reload(sender.tab.id, {})
    },
    remove_page: async (sender) => {
        await chrome.tabs.remove(sender.tab.id)
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
    hover: async (msg, sender) => {
        const params = msg.params
        const mouseMoved = { type: 'mouseMoved', x: params.x, y: params.y }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseMoved)
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