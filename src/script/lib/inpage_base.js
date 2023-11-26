console.log("boternet injected")
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
window.boternet = {}


window.boternet.service = {}
window.boternet.execCommand = async (msg) => {
    try {
        const resp = await window.boternet.service[msg.method](msg.params)
        if (msg.return) {
            msg.type = 'resp'
            msg.target = 'contentscript'
            msg.result = resp
            msg.to = msg.from
            window.postMessage(msg, window.location.origin)
        }
    } catch (error) {
        console.log("inpage base error", String(error), msg)
    }
}

window.boternet.requestMap = {}

window.boternet.request = async (taskId, to, method, params) => {
    return await window.boternet._request(taskId, to, method, params, true)
}

window.boternet._request = async (taskId, to, method, params, withResp) => {
    const id = window.boternet.newMessageId()
    const resp = await new Promise((resolve, reject) => {
        window.boternet.requestMap[id] = { id, resolve, reject }
        window.postMessage({
            id: id,
            target: "contentscript",
            name: "boternet-provider",
            type: 'req',
            taskId: taskId,
            to: to,
            method: method,
            params: params,
            return: withResp
        }, window.location.origin)
    })
    delete window.boternet.requestMap[id]
    return resp
}

window.boternet.newMessageId = () => {
    return Math.floor((1 + Math.random()) * 10000000000000)
}