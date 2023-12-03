class Boternet {
    constructor() {
        this.service = {}
        this.requestMap = {}
    }

    //通常用于创建请求的message id
    randomId = () => {
        return Math.floor((1 + Math.random()) * 10000000000000)
    }

    // boter和controller互相请求或请求插件，会挂起resolve等待返回结果
    _request = async (jobId, to, method, params, withResp) => {
        const id = this.randomId()
        const resp = await new Promise((resolve, reject) => {
            this.requestMap[id] = { id, resolve, reject }
            window.postMessage({
                id: id,
                target: "contentscript",
                name: "boternet-provider",
                type: 'req',
                jobId: jobId,
                to: to,
                method: method,
                params: params,
                return: withResp
            }, window.location.origin)
        })
        delete this.requestMap[id]
        return resp
    }

    request = async (jobId, to, method, params) => {
        return await this._request(jobId, to, method, params, true)
    }

    // 接收并处理来自boter或controller的service函数调用，返回值
    execCommand = async (msg) => {
        try {
            const resp = await this.service[msg.method](msg.params, msg)
            if (msg.return) {
                msg.type = 'resp'
                msg.target = 'contentscript'
                msg.result = resp
                msg.to = msg.from
                window.postMessage(msg, window.location.origin)
            }
        } catch (error) {
            console.log("inpage base error", error, JSON.stringify(error), msg)
        }
    }
}

window.boternet = new Boternet()

// 接收并处理所有发给inpage的消息，如果是service调用则执行execCommand，如果是请求resolve
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
        console.log("base listener error: ", error.error, event.data)
    }
})
