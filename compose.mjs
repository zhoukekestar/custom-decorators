//
// 代码大部分基于 koa-compose
// 在原有基础上，支持最后一个函数的 args 打平调用（被装饰的函数无感）
// 支持同步插件调用
//
export default function (middleware, options = {}) {
  const { sync = false } = options

  if (!Array.isArray(middleware))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) {
        if (sync) return new Error('next() called multiple times')
        return Promise.reject(new Error('next() called multiple times'))
      }
      index = i
      let fn = middleware[i]

      // 最后一个函数，一般就是被注解的本事函数，不会调用 next
      if (i === middleware.length) fn = next
      if (!fn) {
        if (sync) return null
        return Promise.resolve()
      }


      try {
        // 为了不改变扩展点函数的写法，最后一个函数，按打平参数传入
        if (i === middleware.length - 1) {
          if (sync) {
            // Context 中约定了 self 和 args 两个属性
            return fn.call(context.self, ...context.args)
          }
          return Promise.resolve(fn.call(context.self, ...context.args))
        }

        // 其他中间件函数，按 koa 的洋葱模型进行调用
        if (sync) {
          return fn.call(context.self, context, dispatch.bind(null, i + 1))
        }
        // 添加 this 指向
        // 如果是箭头函数，就用 context.self 来获取
        return Promise.resolve(
          fn.call(context.self, context, dispatch.bind(null, i + 1))
        )
      } catch (err) {
        if (sync) {
          throw err
        }
        return Promise.reject(err)
      }
    }
  }
}
