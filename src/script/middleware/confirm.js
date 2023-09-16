import { anyMsg } from "../../common/wrap"
import { account_unlocked, check_white_list, reset_badge, show_badge, show_noti, show_login } from "../service"

const loginList = ['eth_sendTransaction', 'personal_sign', 'eth_requestAccounts', 'eth_accounts']

export const checkConfirm = async (msg, sender, sendResponse, next) => {
    await show_badge(msg)

    if (loginList.includes(msg.value.method)) {
        let unlocked = await account_unlocked()
        if (!unlocked) {
            await show_login()
            return end(msg, sender, sendResponse)
        }
    }

    let ok = await check_white_list(msg, sender) ? true : await show_noti(msg, sender)
    if (!ok) {
        return end(msg, sender, sendResponse)
    }

    await next()

    await reset_badge()
}

const end = async (msg, sender, sendResponse) => {
    await reset_badge()
    sendResponse(anyMsg(msg.id, ''))
}