import compose from './compose.mjs';

const globalWindow = typeof window !== 'undefined' ? window : global;

// 保存到全局变量
const name = Symbol.for('__CUSTOM_CAHCE__');
const cache = globalWindow[name] || {};
globalWindow[name] = cache;

/**
 * 注册自定义扩展点
 * @param {string} name 自定义扩展点名称
 * @param {function} callback 自定义扩展点回调
 */
function register (name, callback) {
  cache[name] = (cache[name] || []).concat(callback);
}

function getMiddleware (name, handler) {
  const middles = (cache?.[name] || []);
  return Array.from(middles).reverse().concat(handler);
}
/**
 * 注册自定义扩展点
 * @param {string} name 自定义扩展点名称
 */
export default (name, callback) => {
  // 如果有 callback，说明是注册函数
  if (typeof callback === 'function') {
    register(name, callback);

    // 否则，就是声明自定义扩展点
  } else {
    return (method, context) => {
      if (context.kind === 'method') {
        const isAsyncFunction = method[Symbol.toStringTag] === 'AsyncFunction';
        const sync = isAsyncFunction ? false : true;

        if (sync) {
          return function (...args) {
            // 把当前方法，放在洋葱模型最里面
            const result = compose(getMiddleware(name, method), { sync })({
              args,
              self: this,
            });
            return result?.return || result;
          };
        }
        /**
         * 异步函数
         */
        return async function (...args) {
          // 把当前方法，放在洋葱模型最里面
          const result = await compose(getMiddleware(name, method))({
            args,
            self: this,
          });
          return result?.return || result;
        };
      }

      // 支持在 class 中直接用变量形式声明
      /*
          @custom('test')
          onClick = async e => {}
        */
      if (context.kind === 'field') {
        return function (methodOrOthers) {
          if (typeof methodOrOthers === 'function') {
            const isAsyncFunction =
              methodOrOthers[Symbol.toStringTag] === 'AsyncFunction';
            const sync = isAsyncFunction ? false : true;

            // 如果是同步函数
            if (sync) {
              return function (...args) {
                const result = compose(getMiddleware(name, methodOrOthers), {
                  sync,
                })({ args, self: this });

                return result?.return || result;
              };
            }

            return async function (...args) {
              const result = await compose(getMiddleware(name, methodOrOthers))(
                {
                  args,
                  self: this,
                }
              );
              return result?.return || result;
            };
          }
        };
      }
    };
  }
};
