
if (shouldInjectProvider()) {

    chrome.runtime.onMessage.addListener((msg, from, sendResponse) => {
        msg.target = "inpage"
        window.postMessage(msg, window.location.origin)
        return false
    })

    window.addEventListener('message', async (event) => {
        const msg = event.data
        if (!msg || msg.name != "boternet-provider" || msg.target != 'contentscript') {
            return
        }

        if (msg.to) {
            await chrome.runtime.sendMessage(msg)
        } else {
            msg.target = "inpage"
            msg.type = "resp"
            if (msg.method == 'connect') {
                const port = await chrome.runtime.connect()
                msg.result = port
            } else {
                const resp = await chrome.runtime.sendMessage(msg)
                if (resp.err) {
                    msg.err = resp.err
                } else {
                    msg.result = resp.data
                }
            }
            window.postMessage(JSON.parse(JSON.stringify(msg)), window.location.origin)
        }
    })
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
