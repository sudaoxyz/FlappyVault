class Boternet {
    constructor() {
        this.service = {}
        this.requestMap = {}
    }
    newMessageId = () => {
        return Math.floor((1 + Math.random()) * 10000000000000)
    }

    _request = async (taskId, to, method, params, withResp) => {
        const id = this.newMessageId()
        const resp = await new Promise((resolve, reject) => {
            this.requestMap[id] = { id, resolve, reject }
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
        delete this.requestMap[id]
        return resp
    }

    request = async (taskId, to, method, params) => {
        return await this._request(taskId, to, method, params, true)
    }

    execCommand = async (msg) => {
        try {
            const resp = await this.service[msg.method](msg.params)
            if (msg.return) {
                msg.type = 'resp'
                msg.target = 'contentscript'
                msg.result = resp
                msg.to = msg.from
                window.postMessage(msg, window.location.origin)
            }
        } catch (error) {
            console.log("inpage base error", JSON.stringify(error), msg)
        }
    }

    launch = async (context = {}) => {
    }
}

window.boternet = new Boternet()

window.addEventListener('message', async (event) => {
    try {
        const msg = event.data
        if (msg && msg.name == "boternet-provider" && msg.target == 'inpage') {
            if (msg.type == 'resp') {
                if (msg.err) {
                    window.boternet.requestMap[msg.id].reject(msg)
                } else {
                    window.boternet.requestMap[msg.id].resolve(msg.result)
                }
            } else {
                await window.boternet.execCommand(msg)
            }
        }
    } catch (error) {
        console.log("base listener error: ", JSON.stringify(error), event.data)
    }
})
