import './inpage_base'
console.log("boternet boter injected")

// 接收所有walletprovider的request请求，会封装后转发给boternet，并把处理结果通知walletprovider
window.addEventListener('message', async (event) => {
    try {
        const msg = event.data
        const target = msg.target || ""
        if (target.startsWith('btntwallet-contentscript')) {
            // 所有对钱包的请求，不再从contentscript去代理，而是从boter页面中代理，以保持contentscript的通用性
            if (msg.data == 'SYN' || msg.data == 'ACK') {
                window.postMessage({ target: target.replace("contentscript", "inpage"), data: msg.data }, window.location.origin)
            } else {
                // 这里封装wallet请求并转发到boternet
                const tabId = await window.boternet.request(0, 0, "getTabId", {})
                const boterInfo = JSON.parse(sessionStorage.getItem(String(tabId)))
                // 这里获取钱包调用结果
                const result = await window.boternet.request(0, boterInfo.controller, "request_wallet", msg)
                window.postMessage(result, window.location.origin)
                // 如果页面发起连接请求，则响应connect事件
                if (msg.data.data.method == 'wallet_wallets' || msg.data.data.method == 'eth_accounts') {
                    window.postMessage({ message: { action: "connect" } }, window.location.origin)
                }
            }
        }
    } catch (error) {
        console.log("boter inpage error", JSON.stringify(error), event.data)
    }

})

window.boternet.service = {
    isReady: async () => {
        return true
    },
    reload: async () => {
        await window.boternet.request(0, 0, 'reload_page', {})
    },
    attach: async (params) => {
        await window.boternet.request(0, 0, 'attach', {})
    },
    detach: async (params) => {
        await window.boternet.request(0, 0, 'detach', {})
    },
    close: async () => {
        await window.boternet.request(0, 0, 'remove_page', {})
    },
    focus: async (params) => {
        const position = await getPositionAndScroll(params.selector)
        await window.boternet.request(0, 0, 'focus', position)
    },
    input: async (params) => {
        await window.boternet.request(0, 0, 'input', { text: params.text })
    },
    hover: async (params) => {
        const position = await getPositionAndScroll(params.selector)
        await window.boternet.request(0, 0, 'hover', position)
    },
    clickElement: async (params) => {
        const position = await getPositionAndScroll(params.selector)
        await window.boternet.request(0, 0, 'click', position)
    },
    clickCorner: async (params) => {
        const position = await getCorner(params)
        await window.boternet.request(0, 0, 'click', position)
    },
    getText: async (params) => {
        const element = await waitForSelector(params.selector)
        return element.innerText
    },
    fetchJson: async (params) => {
        const resp = await fetch(params.url, params.options)
        return resp.json()
    },
    waitForSelector: async (params) => {
        return await waitForSelector(params.selector, params.options)
    },
    waitForScroll: async (params) => {
        return await waitForScroll(params.selector, params.opts)
    },
    invoke: async (params) => {
        const f = window[params.method]
        if (!f) {
            throw new Error("方法名错误")
        }

        const res = await f(params.params)
        return res
    },
    ethereumRequest: async (params) => {
        if (!window.ethereum) {
            return { error: "ethereum provider is not inited" }
        }

        const f = window.ethereum[params.method]
        if (!f) {
            return { error: "the method of ethereum provider is undefined" }
        }

        return await f(params.params)
    },
    getEthereum: async () => {
        return {
            isMetaMask: window.ethereum.isMetaMask,
            chainId: window.ethereum.chainId,
            networkVersion: window.ethereum.networkVersion,
            selectedAddress: window.ethereum.selectedAddress
        }
    }
}

async function getCorner(params) {
    if (!params || !params.corner) {
        params = { corner: 'right,buttom' }
    }
    const { clientWidth, clientHeight } = document.documentElement
    const positions = params.corner.split(',')
    if (positions.length != 2) {
        throw new Error("corner 参数错误")
    }
    return {
        x: positions[0] == 'left' ? 1 : clientWidth - 1, //避开滚动条
        y: positions[1] == 'top' ? 1 : clientHeight - 1
    }
}

async function getPositionAndScroll(selector) {
    const delta = await getScrollDelta({ selector })
    if (delta.error) {
        throw new Error(delta.error)
    }

    if (delta.deltaY != 0) {
        await window.boternet.request(0, 0, 'scroll_page', delta)
        await waitForScroll(selector)
    }

    const position = await getPosition({ selector })
    if (position.error) {
        throw new Error(position.error)
    }

    return position
}

async function getPosition(params) {
    const element = await waitForSelector(params.selector)
    const rect = element.getBoundingClientRect()
    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
    }
}

async function getScrollDelta(params) {
    const element = await waitForSelector(params.selector)
    return _getScrollDelta(element)
}

function _getScrollDelta(element) {
    const { clientHeight } = document.documentElement
    const { top, bottom, height } = element.getBoundingClientRect()
    if (top < 0) return { deltaX: 0, deltaY: top }
    if (bottom > clientHeight) return { deltaX: 0, deltaY: bottom - clientHeight }
    return { deltaX: 0, deltaY: 0 }
}

function waitForSelector(selector, opts = { timeout: 10000 }) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector)
        if (element) {
            resolve(element)
            return
        }
        const mutObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                const nodes = Array.from(mutation.addedNodes)
                for (const node of nodes) {
                    if (node.matches && node.matches(selector)) {
                        mutObserver.disconnect()
                        resolve(node)
                        return
                    }
                }
            }
        })
        mutObserver.observe(document.documentElement, { childList: true, subtree: true })
        if (opts.timeout) {
            setTimeout(() => {
                mutObserver.disconnect()
                if (opts.optional) {
                    resolve(null)
                } else {
                    reject(new Error(`Timeout exceeded while waiting for selector ("${selector}").`))
                }
            }, opts.timeout)
        }
    })
}

async function waitForScroll(selector, opts = { timeout: 200 }) {
    const element = await waitForSelector(selector)
    await new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            reject("Timeout exceeded in wait until ")
        }, opts.timeout)
        const check = () => {
            const delta = _getScrollDelta(element)
            if (delta.deltaY == 0) {
                clearTimeout(timer)
                resolve(delta)
            } else {
                requestAnimationFrame(check)
            }
        }
        check()
    })
}

async function waitForDocumentReady(opts = { timeout: 30000 }) {
    await new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            reject("Timeout exceeded in wait until ")
        }, opts.timeout)
        const check = () => {
            if (window.document.readyState == 'complete') {
                clearTimeout(timer)
                resolve()
            } else {
                requestAnimationFrame(check)
            }
        }
        check()
    })
}

// boter加载完成并通知boternet
waitForDocumentReady().then(async () => {
    const tabId = await window.boternet.request(0, 0, "getTabId", {})
    const boterInfo = JSON.parse(sessionStorage.getItem(String(tabId)))
    const result = await window.boternet.request(0, boterInfo.controller, "boter_ready", { title: window.document.title })
    console.log('boter connected boternet', result)
})