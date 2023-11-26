
window.addEventListener('message', async (event) => {
    console.log("test1", event)
    const msg = event.data
    if (msg && msg.target.startsWith("okexwallet-")) {
        console.log("test2", msg)
    }
})
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

const main = async () => {
    if (shouldInjectProvider()) {
        const context = await getContext()
        if (context.type != 'boter' && context.type != 'controller') {
            return
        }

        chrome.runtime.onMessage.addListener((msg, from, sendResponse) => {
            console.log("contentscript runtime message", msg)
            msg.target = "inpage"
            window.postMessage(msg, window.location.origin)
        })

        window.addEventListener('message', async (event) => {
            const msg = event.data
            if (!msg || msg.name != "boternet-provider" || msg.target != 'contentscript') {
                return
            }

            console.log("contentscript window message", msg)

            if (msg.to) {
                chrome.runtime.sendMessage(msg)
            } else {
                const resp = await chrome.runtime.sendMessage(msg)
                resp.target = "inpage"
                window.postMessage(resp, window.location.origin)
            }
        })

        injectScript("lib/inpage_base.js");

        if (context.type == 'boter') {
            if (context.provider == 'okwallet') {
                injectScript("lib/okwallet_provider.js");
                //发送SYN
            } else if (context.provider == 'metamask') {
                injectScript("lib/metamask_provider.js");
                window.postMessage({ target: 'metamask-inpage', data: { name: 'metamask-provider', data: { method: 'connect' } } })
                window.postMessage({ target: 'metamask-inpage', data: 'SYN' }, window.location.origin)
                //发送SYN
            }
            injectScript("lib/inpage_boter.js");
        } else if (context.type == 'controller') {
            injectScript("lib/inpage_controller.js");
        }
    }
}

main().catch(err => { console.log(err) })

async function getContext() {
    if (window.location.hostname.endsWith("boternet.xyz") || window.location.hostname.endsWith("localhost")) {
        return { type: 'controller' }
    }

    const resp = await chrome.runtime.sendMessage({ method: 'getTabId' })
    const tabId = resp.result
    const sessionData = JSON.parse(sessionStorage.getItem(String(tabId)))
    console.log("getContext sessionData", sessionData)
    if (sessionData) {
        sessionData.type == 'boter'
        return sessionData
    }

    const result = await chrome.storage.local.get([String(tabId)])
    const storeData = result[tabId]
    console.log("getContext storeData", storeData)
    if (storeData) {
        storeData.type == 'boter'
        sessionStorage.setItem(String(tabId), JSON.stringify(storeData))
        await chrome.storage.local.remove(String(tabId))
        console.log("init context", storeData)
        console.log("getContext", storeData)
        return storeData
    }

    return {}
}

function injectScript(path) {
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


function iframeCheck() {
    const isInIframe = self != top;
    if (isInIframe) {
        return true;
    } else {
        return false;
    }
}

function blockedDomainCheck() {
    const blockedDomains = [];
    const currentUrl = window.location.href;
    let currentRegex;
    for (let i = 0; i < blockedDomains.length; i++) {
        const blockedDomain = blockedDomains[i].replace('.', '\\.');
        currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`, 'u');
        if (!currentRegex.test(currentUrl)) {
            return true;
        }
    }
    return false;
}

function documentElementCheck() {
    const documentElement = document.documentElement.nodeName;
    if (documentElement) {
        return documentElement.toLowerCase() === 'html';
    }
    return true;
}

function suffixCheck() {
    const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
    const currentUrl = window.location.pathname;
    for (let i = 0; i < prohibitedTypes.length; i++) {
        if (prohibitedTypes[i].test(currentUrl)) {
            return false;
        }
    }
    return true;
}

function doctypeCheck() {
    const { doctype } = window.document;
    if (doctype) {
        return doctype.name === 'html';
    }
    return true;
}

function shouldInjectProvider() {
    return doctypeCheck() && suffixCheck() && documentElementCheck() && !blockedDomainCheck() && !iframeCheck();
}

