import './inpage_base'

console.log("boternet controller injected")

window.addEventListener('message', async (event) => {
    const msg = event.data
    if (!msg || msg.name != "boternet-provider" || msg.target != 'inpage') {
        return
    }

    if (msg.type == 'resp') {
        if (msg.err) {
            window.boternet.requestMap[msg.id].reject(msg)
        } else {
            window.boternet.requestMap[msg.id].resolve(msg.result)
        }
    } else {
        await window.boternet.execCommand(msg)
    }
})