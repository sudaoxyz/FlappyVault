if (window.self == window.top) {
	const requestMap = {}

	const Role = {
		Content: "sw-content", Background: "sw-background", Popup: "sw-popup", Inpage: "sw-inpage",
		Iframepage: "iframepage", Iframecontent: "iframecontent", Parent: "parent",
		PROVIDER: 'metamask-provider', CONTENT_SCRIPT: 'metamask-contentscript', INPAGE: 'metamask-inpage'
	}
	const request = async (req) => {
		const resp = await chrome.runtime.sendMessage(req)
		console.log("request resp", resp)
		if (resp) {
			formatLog(req, resp.value, null)
		} else {
			formatLog(req, resp, null)
		}
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
	const iframeContentToParentMsg = (id, value) => { return wrap(Role.Iframecontent, Role.Parent, id, value) }
	const iframePageToParentMsg = (id, value) => { return wrap(Role.Iframepage, Role.Parent, id, value) }
	const parentToIframePageMsg = (id, value) => { return wrap(Role.Parent, Role.Iframepage, id, value) }
	const parentToIframecontentMsg = (id, value) => { return wrap(Role.Parent, Role.Iframecontent, id, value) }
	const isb2c = (msg) => { return !!msg ? msg.from == Role.Background && msg.to == Role.Content : false }
	const isIframeContentToParent = (msg) => { return !!msg ? msg.from == Role.Iframecontent && msg.to == Role.Parent : false }
	const isIframePageToParent = (msg) => { return !!msg ? msg.from == Role.Iframepage && msg.to == Role.Parent : false }
	const isb2i = (msg) => { return !!msg ? msg.from == Role.Background && msg.to == Role.Inpage : false }
	const isParentToIframeContent = (msg) => { return msg && msg.from === Role.Parent && msg.to === Role.Iframecontent }
	const isParentToIframePage = (msg) => { return msg && msg.from === Role.Parent && msg.to === Role.Iframepage }

	const isIframe = () => {
		console.log("isIframe", window.location.href, !!sessionStorage.getItem("boternet"))
		return !!sessionStorage.getItem("boternet")
	}

	const requestParent = async (msg) => {
		const payload = msg.data
		payload.boternet = sessionStorage.getItem("boternet")
		console.log("2222222222 - requestParent req", msg, payload)
		const reqMsg = iframeContentToParentMsg(payload.id, payload)
		const respMsg = await request(reqMsg)
		console.log("888888888888 - requestParent respMsg", respMsg)
		const resp = respMsg.err ? wrapMetaMaskError(payload.id, respMsg.err) : wrapMetaMask(payload.id, respMsg.value)

		console.log("999999999999 - requestParent resp", resp)
		window.postMessage(resp, window.location.origin)
	}

	const requestIframeContent = async (msg) => {
		console.log("requestIframeContent", msg)
		const payload = msg.value
		payload.boterId = msg.tabId
		const reqMsg = parentToIframecontentMsg(payload.id, payload)
		const resp = await request(reqMsg)
		window.postMessage(iframeContentToParentMsg(payload.id, resp), window.location.origin)
	}

	const requestIframePage = async (msg) => {
		msg.boterId = msg.tabId
		console.log("bbbbbbbbbb - requestIframePage req", msg)
		const resp = await request(msg)
		console.log("cccccccccc - requestIframePage resp", resp)
		window.postMessage(iframePageToParentMsg(msg.id, resp.value), window.location.origin)
	}


	const requestBg = async (msg) => {
		const payload = msg.data
		const reqMsg = c2bMsg(payload.id, payload)
		const respMsg = await request(reqMsg)

		const resp = respMsg.err ? wrapMetaMaskError(payload.id, respMsg.err) : wrapMetaMask(payload.id, respMsg.value)
		// if (payload.method == "create_iframe") {
		// 	console.log("create_iframe tab ID", resp, resp.data.data.result)
		// 	boterId = resp.data.data.result
		// }
		window.postMessage(resp, window.location.origin)
	}

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

	// content script service
	const cs = {
		initIframe: async (params) => {
			sessionStorage.setItem("boterId", params.boterId)
			sessionStorage.setItem("boternet", params.boternet)
			injectScript(iframe)
			console.log("initIframe", params)
			console.log("isIframe", isIframe())
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

	const readySync = async () => {
		await new Promise(resolve => {
			const documentCheck = setInterval(() => {
				if (window.document.readyState == 'complete') {
					clearInterval(documentCheck)
					resolve()
				}
			}, 500)
		})
	}

	const metamaskWindowListener = async (event, _request) => {
		if (event.data.target == Role.CONTENT_SCRIPT) {
			const msg = event.data.data
			if (msg == 'SYN' || msg == 'ACK') {
				window.postMessage({ target: Role.INPAGE, data: msg }, window.location.origin)
			} else {
				await _request(msg)
			}
		}
	}

	const iframeToParentRuntimeListener = async (msg, from, sendResponse) => {
		requestMap[msg.id] = sendResponse
		console.log("55555555555555 - send to parent ui from contentscript", msg)
		window.postMessage(msg, window.location.origin)
	}

	const b2cRuntimeListener = async (msg, from, sendResponse) => {
		const method = cs[msg.value.method]
		if (!method) {
			sendResponse(anyErr(msg.id, new Error("unsupported method")))
		} else {
			try {
				const resp = await method(msg.value.params)
				sendResponse(anyMsg(msg.id, resp))
			} catch (error) {
				sendResponse(anyErr(msg.id, error))
			}
		}
	}


	// 监听injected的消息
	window.addEventListener('message', async (event) => {
		if (isIframe()) {
			console.log("11111111111 - iframe cs window event", event)
			if (isIframePageToParent(event.data)) {
				const msg = event.data
				console.log("66666666666666 - parent contentscript window isParentToIframeContent", msg, msg.id, msg.id > 0)
				if (msg.isRes) {
					const sendResponse = requestMap[msg.id]
					console.log("66666666666666aaaaaa -", msg)
					sendResponse(anyMsg(msg.id, msg.value))
					// sendResponse({ data: ["111"] })
					delete requestMap[msg.id]
				}
			} else {
				console.log("parent cs window event", event)
				await metamaskWindowListener(event, requestParent)
			}
		} else {
			console.log("parent contentscript window event", event)
			if (isParentToIframeContent(event.data)) {
				const msg = event.data
				console.log("66666666666666 - parent contentscript window isParentToIframeContent", msg, msg.id, msg.id > 0)
				if (msg.isRes) {
					const sendResponse = requestMap[msg.id]
					console.log("66666666666666aaaaaa -", msg)
					sendResponse(anyMsg(msg.id, msg.value))
					// sendResponse({ data: ["111"] })
					delete requestMap[msg.id]
				} else {
					await requestIframeContent(msg)
				}

			} else if (isParentToIframePage(event.data)) {
				await requestIframePage(event.data)
			} else {
				console.log("parent cs window event", event)
				await metamaskWindowListener(event, requestBg)
			}
		}
	})

	// 监听background或pop的消息
	chrome.runtime.onMessage.addListener((msg, from, sendResponse) => {
		if (isParentToIframePage(msg)) {
			console.log("dddd1111111111111isParentToIframePage", msg)
			requestMap[msg.id] = sendResponse
			window.postMessage(msg, window.location.origin)
			return true
		} else if (isParentToIframeContent(msg)) {
			b2cRuntimeListener(msg, from, sendResponse)
			return true
		} else if (isIframeContentToParent(msg)) {
			// 这里没有进来xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
			console.log("4444444444444444 - parent contentscript runtime ", msg)
			iframeToParentRuntimeListener(msg, from, sendResponse)
			return true
		} else if (isb2i(msg)) {
			window.postMessage(wrapMetaMask(msg.id, msg.value), window.location.origin)
			return false
		} else if (isb2c(msg)) {
			b2cRuntimeListener(msg, from, sendResponse)
			return true
		}
	})

	window.postMessage(wrapMetaMaskNotify('connect', undefined), window.location.origin)

	window.postMessage({ target: Role.INPAGE, data: "SYN" }, window.location.origin)
}
