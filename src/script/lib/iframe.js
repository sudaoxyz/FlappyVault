console.log("iframe injected")

window.addEventListener('message', async (event) => {
    const msg = event.data
    if (!msg || msg.name != "boternet-provider") {
        return
    }


    try {
        const resp = await inpageService[msg.value.method](msg.value.params)
        console.log("==============", msg, resp)
        window.postMessage(wrapRes('iframepage', 'parent', msg.id, resp), '*')
    } catch (error) {
        window.postMessage(wrapRes('iframepage', 'parent', msg.id, { error: error.message }), '*')
    }
})

const inpageService = {
    getText: async (params) => {
        const element = await waitForSelector(params.selector)
        return element.innerText
    },
    fetchJson: async (params) => {
        const resp = await fetch(params.url, params.options)
        return resp.json()
    },
    getPosition: async (params) => {
        const element = await waitForSelector(params.selector)
        const rect = element.getBoundingClientRect()
        return {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
        }
    },
    getScrollDelta: async (params) => {
        const element = await waitForSelector(params.selector)
        return _getScrollDelta(element)
    },
    getCorner: async (params) => {
        if (!params || !params.corner) {
            params = { corner: 'right,buttom' }
        }
        const { clientWidth, clientHeight } = document.documentElement
        const positions = params.corner.split(',')
        if (positions.length != 2) {
            return { error: "corner 参数错误" }
        }
        return {
            x: positions[0] == 'left' ? 1 : clientWidth - 1, //避开滚动条
            y: positions[1] == 'top' ? 1 : clientHeight - 1
        }
    },
    waitForSelector: async (params) => {
        return await waitForSelector(params.selector, params.opts)
    },
    waitForScroll: async (params) => {
        return await waitForScroll(params.selector, params.opts)
    },
    invoke: async (params) => {
        const f = window[params.method]
        if (!f) {
            return { error: "方法名错误" }
        }

        const res = await f(params.params)
        return res
    },
    invokeEthereum: async (params) => {
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

const _getScrollDelta = (element) => {
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