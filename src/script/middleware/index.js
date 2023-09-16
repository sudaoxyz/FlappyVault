// 每一个middleware需要返回一个{next:bool,resp:any}表示是否可以继续
export const withMiddlewares = async (msg, sender, sendResponse, excute, middlewares) => {
    if (!middlewares.length) {
        return await excute(msg, sender, sendResponse)
    }

    const reversemw = middlewares.reverse()
    let index = 0

    const next = async () => {
        if (index >= reversemw.length) {
            return await excute(msg, sender, sendResponse)
        }

        let middleware = reversemw[index]
        index++

        return await middleware(msg, sender, sendResponse, next)
    }

    await next()
}