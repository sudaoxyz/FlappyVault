import { getTabs, setTabs } from "../db"

export const get_tab_chain = async (tabId) => {
    const tabs = await getTabs()
    const tab = tabs.find(item => item.id == tabId)
    if (!tab) {
        return ''
    }
    return tab.chainName || ''
}

export const set_tab_chain = async ({ tabId, chainName }) => {
    const tabs = await getTabs()
    tabs.forEach((item, index) => {
        if (item.id == tabId) {
            tabs[index].chainName = chainName
        }
    })
    await setTabs(tabs)
}
export const get_tabs = async () => {
    await refresh_tabs()
    return await getTabs()

}

export const refresh_tabs = async () => {
    const tabs = await getTabs()
    const targets = await chrome.debugger.getTargets()
    const tabTargets = targets.filter(target => !!target.tabId)
    const newTabs = tabTargets.map(tt => {
        const tab = tabs.find(tab => tab.id == tt.tabId)
        return {
            id: tt.tabId,
            title: tt.title,
            url: tt.url,
            chainName: tab ? tab.chainName : '',
            trusted: tab ? tab.trusted : false
        }
    })
    await setTabs(newTabs)
}

export const reset_tabs = async (tabIds) => {
    let tabs = await getTabs()
    tabs = tabs.filter(item => !tabIds.includes(item.id))
    await setTabs(tabs)
}

export const change_tabs_trust = async (params) => {
    let tabs = await getTabs()
    tabs.forEach((item, index) => {
        if (params.ids.includes(item.id)) {
            tabs[index].trusted = params.trusted
        }
    })
    await setTabs(tabs)
}

export const check_white_list = async (msg, sender) => {
    if (msg.value.method != 'eth_sendTransaction' && msg.value.method != 'personal_sign') {
        return true
    }

    if (!sender.tab) {
        return false
    }

    let tabs = await getTabs()
    const tab = tabs.find(item => item.id == sender.tab.id && item.trusted)
    return !!tab
}