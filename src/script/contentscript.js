const Role = {
	Content: "sw-content", Background: "sw-background", Popup: "sw-popup", Inpage: "sw-inpage",
	PROVIDER: 'metamask-provider', CONTENT_SCRIPT: 'metamask-contentscript', INPAGE: 'metamask-inpage'
}
const request = async (req, tabId) => {
	let resp;
	if (tabId) { resp = await chrome.tabs.sendMessage(tabId, req) }
	resp = await chrome.runtime.sendMessage(req)
	formatLog(req, resp.value, null)
	return resp
}
const formatLog = (msg, resp, error) => {
	console.log('%s(%s) return %s [%s] | %s->%s', msg.value.method, msg.value.params ? JSON.stringify(msg.value.params) : '', resp === '' ? resp : JSON.stringify(resp),
		error ? `error:${JSON.stringify(error)}` : 'success', msg.from.substring('sw-'.length), msg.to.substring('sw-'.length))
}
const wrapMetaMask = (id, result) => { return { target: Role.INPAGE, data: { name: Role.PROVIDER, data: { jsonrpc: '2.0', id: id, result: result } } } }
const wrapMetaMaskError = (id, error) => { return { target: Role.INPAGE, data: { name: Role.PROVIDER, data: { jsonrpc: '2.0', id: id, error: error } } } }
const wrapMetaMaskNotify = (method, params) => { return { target: Role.INPAGE, data: { name: Role.PROVIDER, data: { method: method, params: params } } } }
const wrap = (from, to, id, value, err) => { return { from: from, to: to, id: id, value: value, err: err } }
const anyMsg = (id, value) => { return wrap(null, null, id, value) }
const anyErr = (id, error) => { return wrap(null, null, id, null, error) }
const c2bMsg = (id, value) => { return wrap(Role.Content, Role.Background, id, value) }
const isb2c = (msg) => { return !!msg ? msg.from == Role.Background && msg.to == Role.Content : false }
const isb2i = (msg) => { return !!msg ? msg.from == Role.Background && msg.to == Role.Inpage : false }

const externalMethodPrefix = ['eth', 'wallet', 'personal', 'metamask', 'net']
const metamask = "lib/metamask_provider.js"
const iframe = "lib/iframe.js"
const injectScript = (path) => {
	const src = chrome.runtime.getURL(path)
	try {
		const container = document.head || document.documentElement;
		const scriptTag = document.createElement('script');
		scriptTag.async = false
		scriptTag.setAttribute('async', false);
		scriptTag.type = 'module';
		scriptTag.src = src;
		scriptTag.onload = () => { container.removeChild(scriptTag) }
		container.insertBefore(scriptTag, container.children[0]);
	} catch (error) {
		console.error(`FlappyVault: injection ${path} failed [${error}].`);
	}
}

injectScript(metamask)

const isParentToIframeContent = (msg) => {
	return msg && msg.from === "parent" && msg.to === "iframecontent"
}
const requestParent = async (msg) => {
	const payload = msg.data
	window.parent.postMessage(wrap('iframecontent', 'parent', payload.id, payload), '*')
}
const requestBg = async (msg) => {
	const payload = msg.data
	const reqMsg = c2bMsg(payload.id, payload)
	const respMsg = await request(reqMsg)

	const resp = respMsg.err ? wrapMetaMaskError(payload.id, respMsg.err) : wrapMetaMask(payload.id, respMsg.value)
	window.postMessage(resp, window.location.origin)
}

// content script service
const cs = {
	set_iframe: async (params) => {
		if (window.self != window.parent && params.length > 0
			&& params[0] && params[0].startsWith(window.location.origin)) {
			_request = requestParent
			injectScript(iframe)
		}
	},
	chainChanged: async (chainId) => {
		const params = {
			chainId: `0x${parseInt(chainId, 10).toString(16)}`,
			networkVersion: chainId.toString(),
		}
		window.postMessage(wrapMetaMaskNotify('metamask_chainChanged', params), window.location.origin)
	},

	accountsChanged: async (accounts) => {
		window.postMessage(wrapMetaMaskNotify('metamask_accountsChanged', [accounts[0]]), window.location.origin)
	}

	// metamask_unlockStateChanged
}

// 监听injected的消息
window.addEventListener('message', async (event) => {
	if (isParentToIframeContent(event.data)) {

		const msg = event.data
		if (msg.id > 0) {
			if (msg.err) {
				window.postMessage(wrapMetaMaskError(msg.id, { code: msg.err.code || -10001 }), window.location.origin)
			} else {
				window.postMessage(wrapMetaMask(msg.id, msg.value), window.location.origin)
			}

		} else {
			await cs[msg.value.method](msg.value.params)
		}

	} else if (event.data.target == Role.CONTENT_SCRIPT) {

		const msg = event.data.data
		if (msg == 'SYN' || msg == 'ACK') {
			window.postMessage({ target: Role.INPAGE, data: msg }, window.location.origin)
		} else {
			await _request(msg)
		}

	}
})

// 监听background或pop的消息
chrome.runtime.onMessage.addListener((msg, from, sendResponse) => {
	if (isb2i(msg)) {
		window.postMessage(wrapMetaMask(msg.id, msg.value), window.location.origin)
		return false
	} else if (isb2c(msg)) {
		const method = cs[msg.value.method]
		if (!method) {
			return sendResponse(anyErr(msg.id, new Error("unsupported method")))
		}

		method(msg.value.params).then((resp) => {
			sendResponse(anyMsg(msg.id, resp))
		}).catch((error) => {
			sendResponse(anyErr(msg.id, error))
		})
	}
	return true
})

let _request = requestBg

window.postMessage(wrapMetaMaskNotify('connect', undefined), window.location.origin)

window.postMessage({ target: Role.INPAGE, data: "SYN" }, window.location.origin)


if (window.self != window.parent) {
	(async () => {
		await new Promise(resolve => {
			const documentCheck = setInterval(() => {
				if (window.document.readyState == 'complete') {
					clearInterval(documentCheck)
					resolve()
				}
			}, 500)
		})
		window.parent.postMessage(wrap('iframepage', 'parent', 0, 'ready'), '*')
	})()
}