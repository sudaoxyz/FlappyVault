import { ref } from "vue";

export const requestState = ref({})

export const request = async (req, tabId) => {
	let resp;
	if (tabId) {
		resp = await chrome.tabs.sendMessage(tabId, req)
	}

	resp = await chrome.runtime.sendMessage(req)
	requestState.value = req.value
	// dev log
	formatLog(req, resp.value, null)

	return resp
}

const formatLog = (msg, resp, error) => {
	console.log('%s(%s) return %s [%s] | %s->%s',
		msg.value.method,
		msg.value.params ? JSON.stringify(msg.value.params) : '',
		resp === '' ? resp : JSON.stringify(resp),
		error ? `error:${JSON.stringify(error)}` : 'success',
		msg.from.substring('sw-'.length),
		msg.to.substring('sw-'.length))
}