// const data = {
//     id: 0,
//     target:'',
//     to: 0,
//     from: 0,
//     type:"req\resp"
//     jobId:0,
//     name: "boternet-provider",
//     method: "",
//     params: "",
//     result: "",
//     err:"",
//     return: true
// }


// const okexEventMap = {}

// const logs = {}
// const bitcoinLogs = {}

// let n = 0

// const addLogs = (target, id, method, params, result) => {
//     console.log("add logs", JSON.stringify({ target, id, method, params, result }))
//     const f = `async (${JSON.stringify(params)}) => {
//         return ${JSON.stringify(result)}
//     }`
//     if (target.startsWith('okexwallet-contentscript')) {
//         logs[method] = f
//     } else if (target.startsWith('okexwallet-contentscript-bitcoin')) {
//         bitcoinLogs[method] = f
//     }
// }

// setInterval(() => {
//     console.log("logs as service", JSON.stringify(logs))
//     console.log("bitcoinLogs as service", JSON.stringify(bitcoinLogs))
// }, 60000);

// window.addEventListener('message', async (event) => {
//     const msg = event.data
//     const target = msg.target || ""
//     n++
//     console.log("request number" + n, target, ((msg.data || '').data || '').method, msg)
//     if (target.startsWith('okexwallet-contentscript')) {
//         if (msg.data && msg.data.data) {
//             const id = msg.data.data.id
//             const method = msg.data.data.method
//             const params = msg.data.data.params
//             const result = await new Promise(resolve => {
//                 okexEventMap[id] = resolve
//             })
//             // console.log("request msg: ", JSON.stringify({ target, id, method, params, result }))
//             addLogs(target, id, method, params, result)
//         }
//     } else if (target.startsWith('okexwallet-inpage')) {// || target == 'btntwallet-inpage-bitcoin'
//         if (msg.data && msg.data.data) {
//             const id = msg.data.data.id
//             if (id) {
//                 const result = msg.data.data.result
//                 okexEventMap[id](result)
//             } else {
//                 const method = msg.data.data.method
//                 const params = msg.data.data.params
//                 console.log("request notify: ", JSON.stringify({ target, id, method, params }))
//             }

//         }
//     }
// })