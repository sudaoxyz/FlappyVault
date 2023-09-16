chrome.debugger.onDetach.addListener((source, reason) => {
    console.log("onDetach: ", source, reason)
})

chrome.debugger.onEvent.addListener((source, method, params) => {
    console.log("onEvent: ", source, method, params)
})

export const setup_iframe = async (params, sender) => {
    const tabTarget = { tabId: sender.tab.id }
    try {
        await chrome.debugger.attach(tabTarget, '1.3')
    } catch (error) { }
}

export const stop_iframe = async (params, sender) => {
    try {
        await chrome.debugger.detach({ tabId: sender.tab.id })
    } catch (error) { }
}

export const select_text = async (params, sender) => {
    const options = { type: 'mousePressed', x: params.x, y: params.y, button: 'left', clickCount: 3 }
    await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", options)
}

export const click_element = async (params, sender) => {
    const mouseDown = { type: 'mousePressed', x: params.x, y: params.y, button: 'left', clickCount: 1 }
    await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseDown)
    const mouseUp = { type: 'mouseReleased', x: params.x, y: params.y, button: 'left' }
    await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseUp)
}

export const input_element = async (params, sender) => {
    for (const c of params.text) {
        const options = { type: 'keyDown', text: c, isKeypad: true }
        await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchKeyEvent", options)
    }
}

export const scroll_page = async (params, sender) => {
    const option = { type: 'mouseWheel', x: params.x + 1, y: params.y + 1, deltaX: params.deltaX, deltaY: params.deltaY }
    await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", option)
}

export const fetchJson = async (params, sender) => {
    const resp = await fetch(params.url, params.options)
    return resp.json()
}